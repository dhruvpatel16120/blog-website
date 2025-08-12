import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Public categories listing
// GET /api/categories?q=&sortBy=&order=&page=&limit=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = (searchParams.get('order') === 'asc' ? 'asc' : 'desc');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy: (() => {
          if (sortBy === 'name') return { name: order };
          if (sortBy === 'updatedAt') return { updatedAt: order };
          return { createdAt: order };
        })(),
        include: { _count: { select: { posts: true } } },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Public categories error:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}


