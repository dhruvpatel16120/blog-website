import Layout from '@/components/layout/Layout';
import { prisma } from '@/lib/db';
import { publicDataCache } from '@/lib/cache';
import { getSidebarSettings } from '@/lib/settings';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// Curated fallback data to serve if database is unreachable or cold-starting
const DEFAULT_FALLBACK_SIDEBAR = {
  sidebarCategories: [
    { name: 'Web Development', slug: 'web-development', count: 12 },
    { name: 'System Design', slug: 'system-design', count: 8 },
    { name: 'React & Next.js', slug: 'react-nextjs', count: 15 },
    { name: 'Cloud & DevOps', slug: 'cloud-devops', count: 7 },
    { name: 'Architecture', slug: 'architecture', count: 9 },
    { name: 'Tutorials', slug: 'tutorials', count: 14 },
  ],
  sidebarTags: [
    { name: 'javascript', slug: 'javascript', count: 18 },
    { name: 'react', slug: 'react', count: 15 },
    { name: 'nextjs', slug: 'nextjs', count: 14 },
    { name: 'typescript', slug: 'typescript', count: 11 },
    { name: 'tailwind', slug: 'tailwind', count: 9 },
    { name: 'nodejs', slug: 'nodejs', count: 8 },
    { name: 'performance', slug: 'performance', count: 7 },
    { name: 'security', slug: 'security', count: 6 },
  ],
  sidebarPosts: [],
  settings: { categoriesCount: 6, tagsCount: 12 },
};

// Global in-memory reference to last successfully fetched data (stale-while-revalidate)
let lastKnownGoodSidebarData = null;

/**
 * Fetch fresh sidebar data from the database with a 4-second timeout.
 * Prevents sleeping serverless databases (like Neon) from hanging the page render.
 */
async function fetchSidebarFromDatabase() {
  const settings = getSidebarSettings();
  const categoriesLimit = settings.categoriesCount || 6;
  const tagsLimit = settings.tagsCount || 12;

  try {
    // 8-second timeout promise to allow serverless cold starts without blocking render
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sidebar database query timed out (8s limit)')), 8000)
    );

    const queryPromise = Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
        take: Math.max(categoriesLimit, 15),
      }),
      prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
        take: Math.max(tagsLimit, 25),
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 12,
        select: {
          slug: true,
          title: true,
          publishedAt: true,
          readTime: true,
          viewCount: true,
          _count: { select: { likes: true } },
        },
      }),
    ]);

    const [categories, tags, posts] = await Promise.race([queryPromise, timeoutPromise]);

    const sidebarCategories = (categories || []).map((c) => ({
      name: c.name,
      slug: c.slug,
      color: c.color || null,
      count: c._count?.posts || 0,
    }));

    const sidebarTags = (tags || []).map((t) => ({
      name: t.name,
      slug: t.slug,
      color: t.color || null,
      count: t._count?.posts || 0,
    }));

    const sidebarPosts = (posts || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.publishedAt ? p.publishedAt.toISOString() : null,
      readingTime: p.readTime,
      views: p.viewCount,
      likesCount: p._count?.likes || 0,
    }));

    const result = {
      sidebarCategories,
      sidebarTags,
      sidebarPosts,
      settings: {
        categoriesCount: categoriesLimit,
        tagsCount: tagsLimit,
      },
    };

    // Cache as last known good
    lastKnownGoodSidebarData = result;
    return result;
  } catch (err) {
    console.warn('[Sidebar DB] Could not reach database, serving resilient fallback data:', err.message || err);
    return lastKnownGoodSidebarData || DEFAULT_FALLBACK_SIDEBAR;
  }
}

/**
 * Next.js Data Cache wrapper with 5-minute background revalidation.
 * Persists data across server requests and reboots.
 */
const getNextDataCachedSidebar = unstable_cache(
  async () => {
    return await fetchSidebarFromDatabase();
  },
  ['public-right-sidebar-v2'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['sidebar-data', 'categories', 'tags', 'posts'],
  }
);

/**
 * Resilient Multi-Tier Cached Sidebar Data Fetcher:
 * Tier 1: In-Memory LRU Cache (0ms latency)
 * Tier 2: Next.js Persistent Data Cache (unstable_cache)
 * Tier 3: Stale-While-Revalidate Fallback (last known good or curated defaults)
 * React Cache: Request-level deduplication within same render pass
 */
export const getSidebarData = cache(async function () {
  // 1. Check in-memory LRU cache first
  const memoryCached = publicDataCache.get('sidebar_data');
  if (memoryCached) return memoryCached;

  try {
    // 2. Fetch through Next.js Data Cache
    const data = await getNextDataCachedSidebar();
    if (data && (data.sidebarCategories?.length > 0 || data.sidebarPosts?.length > 0)) {
      publicDataCache.set('sidebar_data', data, 300000); // 5 minutes in LRU
      return data;
    }
  } catch (error) {
    // Graceful warning instead of console.error to prevent Turbopack error overlay
    console.warn('[Sidebar Cache] Database temporarily unavailable, serving resilient fallback data:', error.message || error);
  }

  // 3. Resilient fallback: return last known good data or curated defaults
  const fallback = lastKnownGoodSidebarData || DEFAULT_FALLBACK_SIDEBAR;
  // Cache the fallback for 30s so we don't spam the failing connection on rapid navigations
  publicDataCache.set('sidebar_data', fallback, 30000);
  return fallback;
});

export default async function PublicLayout({ children }) {
  const { sidebarCategories, sidebarTags, sidebarPosts, settings } = await getSidebarData();

  return (
    <Layout
      sidebarPosts={sidebarPosts}
      sidebarCategories={sidebarCategories}
      sidebarTags={sidebarTags}
      sidebarSettings={settings}
    >
      {children}
    </Layout>
  );
}

export const revalidate = 300;
