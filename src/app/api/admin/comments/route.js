import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/admin/comments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (status) {
      if (status === 'pending') {
        where.approved = false;
      } else if (status === 'approved') {
        where.approved = true;
      } else if (status === 'rejected') {
        where.approved = false;
      } else if (status === 'spam') {
        where.approved = false;
        // You might want to add a spam flag to your comment model
      }
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { fullName: { contains: search, mode: 'insensitive' } } },
        { author: { username: { contains: search, mode: 'insensitive' } } },
        { author: { email: { contains: search, mode: 'insensitive' } } },
        { post: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    if (postId) {
      where.postId = postId;
    }

    if (userId) {
      where.authorId = userId;
    }

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    // Get summary statistics
    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      spamCount,
      todayCount,
    ] = await Promise.all([
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.comment.count({ where: { approved: true } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.comment.count({ where: { approved: false } }), // You might want to add a spam flag
      prisma.comment.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const summary = {
      total: totalCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      spam: spamCount,
      today: todayCount,
    };

    return NextResponse.json({
      comments,
      total,
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Return clearer message when DB cannot be reached (P1001)
    if (error?.code === 'P1001') {
      return NextResponse.json({ error: 'Database is unreachable. Please verify your DATABASE_URL and that the DB server is running.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
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
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
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
