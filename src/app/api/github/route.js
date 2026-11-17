import { NextResponse } from 'next/server';
import { getRepoData, getContributors } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [repo, contributors] = await Promise.all([
      getRepoData(),
      getContributors(),
    ]);

    return NextResponse.json({
      success: true,
      repo,
      contributors,
    });
  } catch (error) {
    console.error('Failed to load GitHub stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}
