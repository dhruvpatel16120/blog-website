import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const s = await prisma.systemSetting.findUnique({ where: { key: 'MAINTENANCE_MODE' } });
    const maintenance = String(s?.value || '').toLowerCase() === 'true';
    return NextResponse.json({ maintenance });
  } catch {
    const envVal = process.env.MAINTENANCE_MODE;
    const maintenance = typeof envVal !== 'undefined' && String(envVal).toLowerCase() === 'true';
    return NextResponse.json({ maintenance }, { status: 200 });
  }
}


