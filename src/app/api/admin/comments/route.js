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
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      isApproved: comment.isApproved || false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      post: comment.post
    }));

    return NextResponse.json(transformedComments);

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { commentId, action, content } = body;

    if (!commentId || !action) {
      return NextResponse.json({ error: 'Comment ID and action are required' }, { status: 400 });
    }

    let updateData = {};

    switch (action) {
      case 'approve':
        updateData = { approved: true };
        break;
      case 'reject':
        updateData = { approved: false };
        break;
      case 'update':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for update' }, { status: 400 });
        }
        updateData = { content };
        break;
      case 'delete':
        await prisma.comment.delete({
          where: { id: commentId }
        });
        return NextResponse.json({ message: 'Comment deleted successfully' });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        author: { select: { name: true, email: true } },
        post: { select: { title: true } }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
