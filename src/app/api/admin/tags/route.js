import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ tags });
}

export async function POST(request) {
  const { name, color } = await request.json();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const slug = slugify(name);
  const tag = await prisma.tag.create({ data: { name, slug, color } });
  await recordAudit({ action: 'TAG_CREATE', entity: 'Tag', entityId: tag.id, metadata: { name } });
  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.tag.delete({ where: { id } });
  await recordAudit({ action: 'TAG_DELETE', entity: 'Tag', entityId: id });
  return NextResponse.json({ message: 'Deleted' });
}


