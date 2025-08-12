import { NextResponse } from 'next/server';
import { incrementPageView } from '@/lib/views';

export async function POST(request) {
  try {
    const { pagePath } = await request.json();

    if (!pagePath) {
      return NextResponse.json(
        { error: 'Page path is required' },
        { status: 400 }
      );
    }

    await incrementPageView(pagePath);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
