import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';
import { getQueueMetrics, processEmailQueue, retryFailedEmails } from '@/lib/email-queue';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    const [metrics, recentJobs] = await Promise.all([
      getQueueMetrics(),
      prisma.emailQueue.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      metrics,
      jobs: recentJobs,
    });
  } catch (error) {
    console.error('Error fetching email queue status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'process';

    if (action === 'retry-failed') {
      const count = await retryFailedEmails();
      return NextResponse.json({ success: true, retriedCount: count });
    }

    // Default action: trigger worker run
    const result = await processEmailQueue(20);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error processing email queue action:', error);
    return NextResponse.json({ error: 'Failed to execute email queue action' }, { status: 500 });
  }
}
