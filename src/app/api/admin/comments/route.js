import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status'); // approved, pending, spam, all
    const search = searchParams.get('search') || '';
    const postId = searchParams.get('postId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (status && status !== 'all') {
      where.approved = status === 'approved';
    }
    
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (postId) {
      where.postId = postId;
    }

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { name: true, email: true, image: true }
          },
          post: {
            select: { title: true, slug: true }
          },
          parent: {
            select: { content: true, author: { select: { name: true } } }
          },
          replies: {
            include: {
              author: { select: { name: true } }
            }
          },
          _count: {
            select: {
              replies: true,
              likes: true
            }
          }
        }
      }),
      prisma.comment.count({ where })
    ]);

    // Get comment statistics
    const [pendingCount, approvedCount, spamCount] = await Promise.all([
      prisma.comment.count({ where: { approved: false } }),
      prisma.comment.count({ where: { approved: true } }),
      prisma.comment.count({ where: { approved: false } }) // You can add a spam field later
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        pending: pendingCount,
        approved: approvedCount,
        spam: spamCount,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
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
    
    if (!session || session.user.role !== 'ADMIN') {
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
