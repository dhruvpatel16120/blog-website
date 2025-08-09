import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/activity';

export async function GET() {
  try {
    // Get recent important activities
    const activities = await getRecentActivity(10);

    return NextResponse.json(activities);

  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
