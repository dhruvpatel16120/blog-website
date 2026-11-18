import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';

async function getUserIdFromSession(session) {
  if (!session?.user) return null;

  if (session.user.type === 'admin') {
    // Check if admin already has a corresponding user record
    let user = null;
    if (session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
    }

    if (!user && session.user.username) {
      user = await prisma.user.findUnique({
        where: { username: session.user.username },
        select: { id: true },
      });
    }

    if (!user) {
      // Create user record for the admin so likes and activities can link to users table
      user = await prisma.user.create({
        data: {
          email: session.user.email || `${session.user.username}@admin.local`,
          username: session.user.username,
          fullName: session.user.fullName || session.user.username,
          avatar: session.user.avatar,
          password: 'admin-user-placeholder',
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
        select: { id: true },
      });
    }

    return user.id;
  }

  // Normal user: verify user exists in the database
  if (session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (user) return user.id;
  }

  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) return user.id;
  }

  return null;
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let liked = false;

    if (session?.user) {
      const userId = await getUserIdFromSession(session);
      if (userId) {
        const existingLike = await prisma.like.findFirst({
          where: {
            userId,
            postId: post.id,
          },
        });
        liked = !!existingLike;
      }
    }

    // Fetch the users who liked this post
    const likes = await prisma.like.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    const likedUsers = likes.map((l) => l.user).filter(Boolean);

    return NextResponse.json({
      liked,
      likesCount: post._count.likes,
      likedUsers,
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to like posts' }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const userId = await getUserIdFromSession(session);
    if (!userId) {
      return NextResponse.json({ error: 'User account not found' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId: post.id,
      },
    });

    let liked = false;

    if (existingLike) {
      // Unlike post
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.userActivity.deleteMany({
          where: {
            userId,
            postId: post.id,
            type: 'LIKE_POST',
          },
        }),
      ]);
      liked = false;
    } else {
      // Like post
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId: post.id,
          },
        }),
        prisma.userActivity.create({
          data: {
            userId,
            postId: post.id,
            type: 'LIKE_POST',
            metadata: JSON.stringify({
              title: post.title,
              slug: post.slug,
            }),
          },
        }),
      ]);
      liked = true;
    }

    const [likesCount, updatedLikes] = await Promise.all([
      prisma.like.count({
        where: { postId: post.id },
      }),
      prisma.like.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: 'desc' },
        take: 60,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              bio: true,
            },
          },
        },
      }),
    ]);

    const likedUsers = updatedLikes.map((l) => l.user).filter(Boolean);

    return NextResponse.json({
      success: true,
      liked,
      likesCount,
      likedUsers,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}
