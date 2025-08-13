import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const s = await prisma.systemSetting.findUnique({ where: { key: 'MAINTENANCE_MODE' } });
    const maintenance = String(s?.value || '').toLowerCase() === 'true';
    return NextResponse.json({ maintenance });
  } catch (e) {
    return NextResponse.json({ maintenance: false }, { status: 200 });
  }
}


