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
  // Also include current public branding snapshot derived from env for the client to display
  return NextResponse.json({ 
    settings,
    public: {
      platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME || '',
      brandLogoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '',
      brandPrimary: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || '',
      supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ''
    }
  });
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

  // If a setting maps to a NEXT_PUBLIC_* value, return a hint for the client to refresh
  const publicMap = new Map([
    ['PLATFORM_NAME', 'NEXT_PUBLIC_PLATFORM_NAME'],
    ['BRAND_LOGO_URL', 'NEXT_PUBLIC_BRAND_LOGO_URL'],
    ['BRAND_PRIMARY_COLOR', 'NEXT_PUBLIC_BRAND_PRIMARY_COLOR'],
    ['SUPPORT_EMAIL', 'NEXT_PUBLIC_SUPPORT_EMAIL'],
    ['DEBUG_MODE', 'NEXT_PUBLIC_DEBUG_MODE'],
    ['MAINTENANCE_MODE', undefined],
  ]);
  const mapped = publicMap.get(key);

  return NextResponse.json({ message: 'Saved', affectsPublicEnv: Boolean(mapped), mappedEnv: mapped });
}

export const runtime = 'nodejs';


