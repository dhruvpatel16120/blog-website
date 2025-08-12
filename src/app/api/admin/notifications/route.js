import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get recent notifications for admins (last 50)
    const notifications = await prisma.notification.findMany({
      where: {
        adminId: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        admin: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        admin: notification.admin
      }))
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { type, message } = await request.json();

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        adminId: session.user.id,
        read: false
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
