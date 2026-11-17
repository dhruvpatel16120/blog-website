import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';

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

    if (session?.user?.id) {
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: session.user.id,
          postId: post.id,
        },
      });
      liked = !!existingLike;
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to like posts' }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const userId = session.user.id;

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
