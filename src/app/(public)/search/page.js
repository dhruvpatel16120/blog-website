import React from 'react';
import { prisma } from '@/lib/db';
import SearchPageClient from '@/components/blog/SearchPageClient';

export default async function SearchPage({ searchParams }) {
  const allPostsRaw = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 500,
    select: {
      id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, readTime: true, publishedAt: true,
      categories: { include: { category: { select: { name: true } } } },
      tags: { include: { tag: { select: { name: true } } } },
      author: { select: { fullName: true, username: true } }
    }
  });
  const allPosts = allPostsRaw.map(p => ({
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
  const categories = Array.from(new Set(allPosts.flatMap(post => post.categories || [])));
  const tags = Array.from(new Set(allPosts.flatMap(post => post.tags || [])));

  const initialQuery = typeof searchParams?.q === 'string' ? searchParams.q : '';

  return (
    <>
      <SearchPageClient allPosts={allPosts} categories={categories} tags={tags} initialQuery={initialQuery} />
    </>
  );
}