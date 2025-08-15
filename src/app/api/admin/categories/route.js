import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
// audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/admin/categories?q=&sortBy=&order=&page=&limit=
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = (searchParams.get('order') === 'asc' ? 'asc' : 'desc');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '5', 10), 1), 50);
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

    // Calculate summary statistics from the full dataset (not paginated)
    const [totalCategories, activeCategories, unusedCategories, totalPosts] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ 
        where: { 
          posts: { some: {} } 
        } 
      }),
      prisma.category.count({ 
        where: { 
          posts: { none: {} } 
        } 
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    return NextResponse.json({ 
      data: items, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      summary: {
        total: totalCategories,
        active: activeCategories,
        unused: unusedCategories,
        totalPosts: totalPosts,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, color, icon } = await request.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
    const slug = slugify(name);

    // Check duplicates
    const conflict = await prisma.category.findFirst({ where: { OR: [{ name: name.trim() }, { slug }] } });
    if (conflict) return NextResponse.json({ error: 'Category with same name or slug already exists' }, { status: 409 });

    const category = await prisma.category.create({ data: { name: name.trim(), slug, description: description?.trim() || null, color: color || null, icon: icon?.trim() || null } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// DELETE remains for backward compatibility using query param id
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const count = await prisma.postCategory.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json({ error: 'Cannot delete category in use' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

