import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, publishAt } = await request.json();
  if (!id || !publishAt) return NextResponse.json({ error: 'id and publishAt required' }, { status: 400 });
  const date = new Date(publishAt);
  if (isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  const post = await prisma.post.update({ where: { id }, data: { published: false, publishedAt: date } });
  return NextResponse.json({ message: 'Scheduled', post });
}


