import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
// audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/admin/tags?q=&sortBy=&order=&page=&limit=&hasPosts=
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const hasPostsParam = searchParams.get('hasPosts');
    const filterHasPosts = hasPostsParam === 'true' ? true : hasPostsParam === 'false' ? false : null;
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filterHasPosts === true
        ? { posts: { some: {} } }
        : filterHasPosts === false
        ? { posts: { none: {} } }
        : {}),
    };

    // Total count and paginated fetch
    const [total, items] = await Promise.all([
      prisma.tag.count({ where }),
      prisma.tag.findMany({
        where,
        orderBy:
          sortBy === 'name'
            ? { name: order }
            : sortBy === 'updatedAt'
            ? { updatedAt: order }
            : sortBy === 'posts'
            ? { posts: { _count: order } }
            : { createdAt: order },
        include: { _count: { select: { posts: true } } },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST /api/admin/tags
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, color } = await request.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
    const newName = name.trim();
    const slug = slugify(newName);

    // Prevent duplicates
    const conflict = await prisma.tag.findFirst({ where: { OR: [{ name: newName }, { slug }] } });
    if (conflict) return NextResponse.json({ error: 'Tag with same name or slug already exists' }, { status: 409 });

    const tag = await prisma.tag.create({ data: { name: newName, slug, color: color || null } });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

// DELETE remains for backward compatibility using query param id
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const count = await prisma.postTag.count({ where: { tagId: id } });
    if (count > 0) {
      return NextResponse.json({ error: 'Cannot delete tag in use' }, { status: 400 });
    }

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}

