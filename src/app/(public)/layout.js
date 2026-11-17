import Layout from '@/components/layout/Layout';
import { prisma } from '@/lib/db';
import { publicDataCache } from '@/lib/cache';

async function getSidebarData() {
  const cached = publicDataCache.get('sidebar_data');
  if (cached) return cached;

  try {
    const [categories, tags, posts] = await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
        take: 15,
      }),
      prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
        take: 25,
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 15,
        select: { slug: true, title: true, publishedAt: true, readTime: true, viewCount: true },
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
    }));

    const result = { sidebarCategories, sidebarTags, sidebarPosts };
    publicDataCache.set('sidebar_data', result, 120000); // 2 minute cache
    return result;
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    return { sidebarCategories: [], sidebarTags: [], sidebarPosts: [] };
  }
}

export default async function PublicLayout({ children }) {
  const { sidebarCategories, sidebarTags, sidebarPosts } = await getSidebarData();

  return (
    <Layout sidebarPosts={sidebarPosts} sidebarCategories={sidebarCategories} sidebarTags={sidebarTags}>
      {children}
    </Layout>
  );
}

export const revalidate = 120;
