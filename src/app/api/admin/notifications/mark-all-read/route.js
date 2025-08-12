import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Mark all unread notifications for admins as read
    await prisma.notification.updateMany({
      where: {
        adminId: { not: null },
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
