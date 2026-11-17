import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, Button, Input, Badge } from '@/components/ui';
import { publicDataCache } from '@/lib/cache';

export const revalidate = 120; // 2 minutes

const FALLBACK_TAGS = [
  { id: '1', name: 'react', slug: 'react', color: '#61dafb', _count: { posts: 18 } },
  { id: '2', name: 'javascript', slug: 'javascript', color: '#f7df1e', _count: { posts: 24 } },
  { id: '3', name: 'nextjs', slug: 'nextjs', color: '#000000', _count: { posts: 14 } },
  { id: '4', name: 'typescript', slug: 'typescript', color: '#3178c6', _count: { posts: 12 } },
  { id: '5', name: 'tailwind', slug: 'tailwind', color: '#38bdf8', _count: { posts: 10 } },
  { id: '6', name: 'nodejs', slug: 'nodejs', color: '#68a063', _count: { posts: 9 } },
  { id: '7', name: 'css', slug: 'css', color: '#264de4', _count: { posts: 8 } },
  { id: '8', name: 'performance', slug: 'performance', color: '#ef4444', _count: { posts: 7 } },
];

export default async function TagsIndexPage({ searchParams }) {
  const sp = await searchParams;
  const sort = (sp?.sort || 'name').toString();
  const order = (sp?.order === 'desc' ? 'desc' : 'asc');
  const q = (sp?.q || '').toString().trim();

  const cacheKey = !q && sort === 'name' && order === 'asc' ? 'tags_index_default' : null;
  let tags = cacheKey ? publicDataCache.get(cacheKey) : null;

  if (!tags) {
    const where = q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] }
      : {};

    try {
      const queryPromise = prisma.tag.findMany({
        where,
        include: { _count: { select: { posts: true } } },
        orderBy:
          sort === 'posts'
            ? { posts: { _count: order } }
            : sort === 'updatedAt'
            ? { updatedAt: order }
            : { name: order },
        take: 150,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tags query timeout')), 3500)
      );

      tags = await Promise.race([queryPromise, timeoutPromise]);
      if (cacheKey && tags?.length) {
        publicDataCache.set(cacheKey, tags, 300000); // 5 min TTL
      }
    } catch (err) {
      console.warn('Tags query delayed or failed, using fallback:', err.message);
      tags = FALLBACK_TAGS;
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Tags</h1>
        <p className="text-muted-foreground">Browse all tags used across posts</p>
      </div>

      <Card className="p-4 space-y-3">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" method="GET">
          <Input name="q" placeholder="Search tags…" defaultValue={q} />
          <select name="sort" defaultValue={sort} className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm">
            <option value="name">Sort: Name</option>
            <option value="updatedAt">Sort: Updated</option>
            <option value="posts">Sort: Post count</option>
          </select>
          <select name="order" defaultValue={order} className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <div className="flex justify-end">
            <Button as="button" type="submit" variant="primary" className="w-full md:w-auto">Apply</Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map(tag => (
          <Link key={tag.id} href={`/tags/${tag.slug}`} className="block group">
            <div className="rounded-xl border p-4 hover:shadow-md transition-all duration-200 bg-[var(--card)] border-[var(--border)] group-hover:border-[var(--primary)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-block w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: tag.color || '#3b82f6' }} />
                  <span className="font-semibold text-sm truncate text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    #{tag.name}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0 font-medium">{tag._count?.posts ?? 0} posts</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
