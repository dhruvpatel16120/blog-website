import React from 'react';
import Link from 'next/link';
import BlogGrid from '@/components/blog/BlogGrid';
import { Badge } from '@/components/ui';
import { prisma } from '@/lib/db';
import { getIconComponent } from '@/lib/icons';

export default async function CategoryPage({ params }) {
  const categorySlug = params.category;
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  const categoryName = category?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');

  const postsRaw = await prisma.post.findMany({
    where: { published: true, categories: { some: { category: { slug: categorySlug } } } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, readTime: true, publishedAt: true,
      categories: { include: { category: { select: { name: true } } } },
      tags: { include: { tag: { select: { name: true } } } },
      author: { select: { fullName: true, username: true } }
    }
  });
  const posts = postsRaw.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    readTime: p.readTime,
    date: p.publishedAt,
    categories: p.categories?.map(c => c.category.name) || [],
    tags: p.tags?.map(t => t.tag.name) || [],
    author: { name: p.author?.fullName || p.author?.username || 'Author' },
  }));

  const Icon = getIconComponent(category?.icon || 'CodeBracketIcon');
  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Icon className="w-6 h-6" style={{ color: (category && category.color) || 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              {categoryName}
            </h1>
            <Badge variant="secondary" className="text-xs">
              {posts.length} posts
            </Badge>
          </div>
        </div>
        <Link href="/categories" className="text-sm hover:text-primary" style={{ color: 'var(--muted-foreground)' }}>All Categories</Link>
      </div>
      {posts.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground py-12">
          No posts found for this category.
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </>
  );
}