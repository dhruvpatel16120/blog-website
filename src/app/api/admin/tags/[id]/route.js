import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
// audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/admin/tags/[id]
export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const tag = await prisma.tag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } });
    if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

// PATCH /api/admin/tags/[id]
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { name, color } = await request.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const newName = name.trim();
    const newSlug = slugify(newName);

    const conflict = await prisma.tag.findFirst({
      where: { id: { not: id }, OR: [{ name: newName }, { slug: newSlug }] },
    });
    if (conflict) return NextResponse.json({ error: 'Tag with same name or slug already exists' }, { status: 409 });

    const updated = await prisma.tag.update({
      where: { id },
      data: { name: newName, slug: newSlug, color: color || null },
    });
    // audit removed
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE /api/admin/tags/[id]
export async function DELETE(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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


