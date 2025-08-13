import React from 'react';
import Link from 'next/link';
import BlogGrid from '@/components/blog/BlogGrid';
import { Badge, Button } from '@/components/ui';
import { prisma } from '@/lib/db';
import { getIconComponent } from '@/lib/icons';

export default async function CategoryPage({ params, searchParams }) {
  const categorySlug = params.category;
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  const categoryName = category?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');

  const page = parseInt(searchParams?.page || '1', 10);
  const limit = 5;

  const total = await prisma.post.count({
    where: { published: true, categories: { some: { category: { slug: categorySlug } } } }
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const postsRaw = await prisma.post.findMany({
    where: { published: true, categories: { some: { category: { slug: categorySlug } } } },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
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
              {total} posts
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
        <>
          <BlogGrid posts={posts} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href={`?page=${page - 1}`}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, idx) => (
                  <Button
                    key={idx + 1}
                    size="sm"
                    as="a"
                    href={`?page=${idx + 1}`}
                    variant={page === idx + 1 ? undefined : 'outline'}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href={`?page=${page + 1}`}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}