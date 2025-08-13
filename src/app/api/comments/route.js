import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// GET /api/comments?postId=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const parentId = searchParams.get('parentId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const where = {
      postId,
      approved: true,
    };

    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null; // Only top-level comments
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { content, postId, parentId } = await request.json();

    if (!content?.trim() || !postId) {
      return NextResponse.json({ error: 'Content and post ID are required' }, { status: 400 });
    }

    // Validate content length
    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      return NextResponse.json({ error: 'Comment must be at least 3 characters long' }, { status: 400 });
    }

    if (parentId && trimmedContent.length > 500) {
      return NextResponse.json({ error: 'Reply cannot exceed 500 characters' }, { status: 400 });
    }

    if (!parentId && trimmedContent.length > 1000) {
      return NextResponse.json({ error: 'Comment cannot exceed 1000 characters' }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If this is a reply, check if parent comment exists and has room for more replies
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId, postId, approved: true },
        include: {
          _count: {
            select: { replies: true }
          }
        }
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      // Check if parent comment has reached the maximum number of replies (3)
      if (parentComment._count.replies >= 3) {
        return NextResponse.json({ error: 'This comment has reached the maximum number of replies (3)' }, { status: 400 });
      }
    }

    // Rate limiting: Check if user has posted too many comments recently
    const recentComments = await prisma.comment.count({
      where: {
        authorId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Last minute
        }
      }
    });

    if (recentComments >= 5) {
      return NextResponse.json({ error: 'Rate limit exceeded. You can only post 5 comments per minute.' }, { status: 429 });
    }

    // For admins, we need to create a user record or use a special approach
    // Since comments are linked to users, we'll create a temporary user record for admins
    let authorId = session.user.id;
    
    if (session.user.type === 'admin') {
      // Check if admin already has a user record
      let adminUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!adminUser) {
        // Create a user record for the admin
        adminUser = await prisma.user.create({
          data: {
            email: session.user.email,
            username: session.user.username,
            fullName: session.user.fullName,
            avatar: session.user.avatar,
            password: 'admin-user-placeholder', // This won't be used for login
            role: 'ADMIN',
            isActive: true
          }
        });
      }
      authorId = adminUser.id;
    }

    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        authorId: authorId,
        postId,
        parentId: parentId || null,
        approved: true, // Auto-approve for now, can be changed to false for moderation
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
