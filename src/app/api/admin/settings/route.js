import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const settings = await prisma.systemSetting.findMany({ select: { key: true, value: true } });
  return NextResponse.json({ settings });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value: value ?? '' },
  });
  await recordAudit({ userId: session.user.id, action: 'SETTING_SAVE', entity: 'SystemSetting', entityId: key });
  return NextResponse.json({ message: 'Saved' });
}


