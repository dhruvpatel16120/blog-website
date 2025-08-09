import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ categories });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, color } = await request.json();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const slug = slugify(name);
  const category = await prisma.category.create({ data: { name, slug, color } });
  await recordAudit({ userId: session.user.id, action: 'CATEGORY_CREATE', entity: 'Category', entityId: category.id, metadata: { name } });
  return NextResponse.json(category, { status: 201 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.category.delete({ where: { id } });
  await recordAudit({ userId: session.user.id, action: 'CATEGORY_DELETE', entity: 'Category', entityId: id });
  return NextResponse.json({ message: 'Deleted' });
}


