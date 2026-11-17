import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's comments and liked posts in parallel
    const [comments, likes, myPosts] = await Promise.all([
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          content: true,
          approved: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              readTime: true,
              publishedAt: true,
              author: {
                select: {
                  fullName: true,
                  username: true,
                },
              },
            },
          },
        },
      }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      comments,
      likes: likes.filter((l) => l.post !== null),
      posts: myPosts,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
