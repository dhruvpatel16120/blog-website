import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// activity/audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, publishedAt, published } = await request.json();

    if (!id || !publishedAt) {
      return NextResponse.json(
        { error: 'Post ID and publish date are required' },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const scheduleDate = new Date(publishedAt);
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        publishedAt: scheduleDate,
        published: published || false
      },
      include: {
        author: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });

    // activity removed

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        publishedAt: updatedPost.publishedAt,
        published: updatedPost.published
      }
    });

  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}


