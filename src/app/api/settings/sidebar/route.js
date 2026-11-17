import { NextResponse } from 'next/server';
import { getSidebarSettings } from '@/lib/settings';

export async function GET() {
  const settings = getSidebarSettings();
  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export const dynamic = 'force-dynamic';
