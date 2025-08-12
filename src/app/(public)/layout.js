import Layout from '@/components/layout/Layout';
import { prisma } from '@/lib/db';

export default async function PublicLayout({ children }) {
  // Sidebar data: top categories/tags by usage and a small recent set of posts for widgets
  const [categories, tags, posts] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: 'desc' } },
      take: 20,
    }),
    prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: 'desc' } },
      take: 30,
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: { slug: true, title: true, publishedAt: true, readTime: true, viewCount: true },
    }),
  ]);

  const sidebarCategories = categories.map(c => ({
    name: c.name,
    slug: c.slug,
    color: c.color || null,
    count: c._count?.posts || 0,
  }));
  const sidebarTags = tags.map(t => ({
    name: t.name,
    slug: t.slug,
    color: t.color || null,
    count: t._count?.posts || 0,
  }));
  const sidebarPosts = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    date: p.publishedAt,
    readingTime: p.readTime,
    views: p.viewCount,
  }));

  return (
    <Layout sidebarPosts={sidebarPosts} sidebarCategories={sidebarCategories} sidebarTags={sidebarTags}>
      {children}
    </Layout>
  );
}

export const revalidate = 120;
