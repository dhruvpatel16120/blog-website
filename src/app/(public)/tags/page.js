import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, Button, Input, Badge } from '@/components/ui';

export default async function TagsIndexPage({ searchParams }) {
  const sort = (searchParams?.sort || 'name').toString();
  const order = (searchParams?.order === 'desc' ? 'desc' : 'asc');
  const q = (searchParams?.q || '').toString().trim();

  const where = q
    ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] }
    : {};

  // Fetch tags with counts
  const tags = await prisma.tag.findMany({
    where,
    include: { _count: { select: { posts: true } } },
    orderBy:
      sort === 'posts'
        ? { posts: { _count: order } }
        : sort === 'updatedAt'
        ? { updatedAt: order }
        : { name: order },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Tags</h1>
        <p className="text-muted-foreground">Browse all tags used across posts</p>
      </div>

      <Card className="p-4 space-y-3">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input name="q" placeholder="Search tags…" defaultValue={q} />
          <select name="sort" defaultValue={sort} className="h-10 rounded border dark:bg-gray-800">
            <option value="name">Sort: Name</option>
            <option value="updatedAt">Sort: Updated</option>
            <option value="posts">Sort: Post count</option>
          </select>
          <select name="order" defaultValue={order} className="h-10 rounded border dark:bg-gray-800">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <div className="flex justify-end">
            <Button as="button" type="submit">Apply</Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map(tag => (
          <Link key={tag.id} href={`/tags/${tag.slug}`} className="block">
            <div className="rounded border p-4 hover:shadow transition bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: tag.color || '#e5e7eb' }} />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{tag._count?.posts ?? 0} posts</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const dynamic = 'force-static';
export const revalidate = 60;


