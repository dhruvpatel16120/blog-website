import React from 'react';
import BlogGrid from '@/components/blog/BlogGrid';
import { Button } from '@/components/ui';
import { prisma } from '@/lib/db';

export default async function BlogPage({ searchParams }) {
  const page = parseInt(searchParams?.page || '1', 10);
  const limit = 9;
  const sort = (searchParams?.sort || 'newest').toString();
  const orderBy = (() => {
    switch (sort) {
      case 'oldest':
        return { publishedAt: 'asc' };
      case 'title':
        return { title: 'asc' };
      case 'readTime':
        return { readTime: 'desc' };
      case 'views':
        return { viewCount: 'desc' };
      default:
        return { publishedAt: 'desc' };
    }
  })();

  const total = await prisma.post.count({ where: { published: true } });
  const totalPages = Math.ceil(total / limit);
  const prismaPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, readTime: true, publishedAt: true, viewCount: true,
      categories: { include: { category: { select: { name: true } } } },
      tags: { include: { tag: { select: { name: true } } } },
      author: { select: { fullName: true, username: true } }
    }
  });
  const posts = prismaPosts.map(p => ({
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

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blog</h1>
          <form className="flex gap-2 items-center">
            <select name="sort" defaultValue={sort} className="h-10 rounded border dark:bg-gray-800">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
              <option value="readTime">Read time</option>
              <option value="views">Most views</option>
            </select>
            <Button as="button" type="submit" variant="outline">Apply</Button>
          </form>
        </div>
        <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>
          Discover insights, tutorials, and best practices in modern web development
        </p>
      </div>

      {/* Blog Grid */}
       <BlogGrid posts={posts} />

      {/* Pagination */}
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
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 60; 