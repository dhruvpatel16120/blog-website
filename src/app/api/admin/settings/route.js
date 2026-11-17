import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { getSidebarSettings, setSidebarSettings } from '@/lib/settings';
import { publicDataCache } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = getSidebarSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categoriesCount, tagsCount } = body;

    const updated = setSidebarSettings({
      categoriesCount: Number(categoriesCount),
      tagsCount: Number(tagsCount),
    });

    // Invalidate sidebar cache so public pages immediately reflect updated numbers
    publicDataCache.delete('sidebar_data');

    return NextResponse.json({
      message: 'Sidebar display settings saved successfully',
      settings: updated,
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
