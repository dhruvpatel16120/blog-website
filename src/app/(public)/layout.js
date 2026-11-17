import Layout from '@/components/layout/Layout';
import { prisma } from '@/lib/db';
import { publicDataCache } from '@/lib/cache';
import { getSidebarSettings } from '@/lib/settings';

async function getSidebarData() {
  const cached = publicDataCache.get('sidebar_data');
  if (cached) return cached;

  try {
    const settings = getSidebarSettings();
    const categoriesLimit = settings.categoriesCount || 6;
    const tagsLimit = settings.tagsCount || 12;

    const [categories, tags, posts] = await Promise.all([
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
        take: 20,
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

    const sidebarCategories = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      color: c.color || null,
      count: c._count?.posts || 0,
    }));

    const sidebarTags = tags.map((t) => ({
      name: t.name,
      slug: t.slug,
      color: t.color || null,
      count: t._count?.posts || 0,
    }));

    const sidebarPosts = posts.map((p) => ({
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

    publicDataCache.set('sidebar_data', result, 120000); // 2 minute cache
    return result;
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    return {
      sidebarCategories: [],
      sidebarTags: [],
      sidebarPosts: [],
      settings: { categoriesCount: 6, tagsCount: 12 },
    };
  }
}

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

export const revalidate = 120;
