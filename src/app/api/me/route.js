import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';
import { userProfileCache } from '@/lib/cache';
import { generateAvatarUrl } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const isUserAdmin = session.user.type === 'admin' || session.user.role === 'ADMIN';

    // Check LRU Cache (O(1) retrieval)
    const cachedData = userProfileCache.get(userId);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Branch logic: Admin vs Normal User
    if (session.user.type === 'admin') {
      const [admin, totalPosts, totalUsers, totalComments] = await Promise.all([
        prisma.admin.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            permissions: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.post.count(),
        prisma.user.count(),
        prisma.comment.count(),
      ]);

      if (!admin) {
        return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
      }

      const responsePayload = {
        ...admin,
        avatar: admin.avatar || generateAvatarUrl(admin.fullName, admin.username),
        bio: 'Platform Administrator',
        website: '',
        location: 'Global',
        type: 'admin',
        stats: {
          postCount: totalPosts,
          userCount: totalUsers,
          commentCount: totalComments,
          likeCount: 0,
        },
      };

      userProfileCache.set(userId, responsePayload);
      return NextResponse.json(responsePayload, { headers: { 'X-Cache': 'MISS' } });
    }

    // Normal User Flow
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
      prisma.like.count({ where: { userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const responsePayload = {
      ...user,
      avatar: user.avatar || generateAvatarUrl(user.fullName, user.username),
      type: 'user',
      stats: {
        postCount,
        commentCount,
        likeCount,
      },
    };

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
