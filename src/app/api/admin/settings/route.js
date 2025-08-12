import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const settings = await prisma.systemSetting.findMany({ select: { key: true, value: true } });
  return NextResponse.json({ settings });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value: value ?? '' },
  });
  return NextResponse.json({ message: 'Saved' });
}


