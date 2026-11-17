import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';
import { userProfileCache } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check LRU Cache (O(1) retrieval)
    const cachedData = userProfileCache.get(userId);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Parallel optimized SQL counts and profile retrieval using indexed foreign keys
    const [user, postCount, commentCount, likeCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          avatar: true,
          bio: true,
          website: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          role: true,
        },
      }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { userId: userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const responsePayload = {
      ...user,
      stats: {
        postCount,
        commentCount,
        likeCount,
      },
    };

    // Store in LRU cache with 45s TTL
    userProfileCache.set(userId, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Error fetching /api/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
