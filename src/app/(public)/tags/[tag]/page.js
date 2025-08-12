import React from 'react';
import Link from 'next/link';
import BlogGrid from '@/components/blog/BlogGrid';
import { Badge, Button } from '@/components/ui';
import { prisma } from '@/lib/db';

export default async function TagPage({ params, searchParams }) {
  const tagSlug = params.tag;
  const tagName = tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1).replace(/-/g, ' ');
  const page = Math.max(parseInt(searchParams?.page || '1', 10), 1);
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

  const where = { published: true, tags: { some: { tag: { slug: tagSlug } } } };

  const [total, postsRaw] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, readTime: true, publishedAt: true, viewCount: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } }
      }
    })
  ]);

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

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Posts tagged: {tagName}
            </h1>
            <Badge variant="secondary" className="text-xs mb-2">{total} posts</Badge>
          </div>
          <form className="flex gap-2 items-center">
            <select name="sort" defaultValue={sort} className="h-10 rounded border dark:bg-gray-800">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
              <option value="readTime">Read time</option>
              <option value="views">Most views</option>
            </select>
            <Button as="button" type="submit" variant="outline">Apply</Button>
          </form>
        </div>
      </div>
      {posts.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground py-12">No posts found for this tag.</div>
      ) : (
        <BlogGrid posts={posts} />
      )}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <Button as={Link} href={`?page=${page - 1}&sort=${sort}`} variant="outline" size="sm" disabled={page <= 1}>Previous</Button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <Button key={idx} as={Link} href={`?page=${idx + 1}&sort=${sort}`} size="sm" variant={page === idx + 1 ? undefined : 'outline'}>
              {idx + 1}
            </Button>
          ))}
          <Button as={Link} href={`?page=${page + 1}&sort=${sort}`} variant="outline" size="sm" disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 60;