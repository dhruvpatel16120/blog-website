import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/admin/categories/[id]
export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PATCH /api/admin/categories/[id]
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { name, description, color, icon } = await request.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const newName = name.trim();
    const newSlug = slugify(newName);

    // Ensure uniqueness against others
    const conflict = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: newName }, { slug: newSlug }],
      },
    });
    if (conflict) return NextResponse.json({ error: 'Category with same name or slug already exists' }, { status: 409 });

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: newName,
        slug: newSlug,
        description: description?.trim() || null,
        color: color || null,
        icon: icon?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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


