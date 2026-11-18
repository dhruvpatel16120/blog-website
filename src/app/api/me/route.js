import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';
import { userProfileCache } from '@/lib/cache';
import { generateAvatarUrl } from '@/lib/utils';
import { getPrivacy } from '@/lib/privacy';

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
            privacy: {
              select: { showEmail: true, showLikedPosts: true },
            },
          },
        }),
        prisma.post.count(),
        prisma.user.count(),
        prisma.comment.count(),
      ]);

      if (!admin) {
        return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
      }

      const matchingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: admin.email },
            { username: admin.username },
          ],
        },
        select: {
          id: true,
          privacy: {
            select: { showEmail: true, showLikedPosts: true },
          },
        },
      });

      const fallback = getPrivacy(userId, admin.username, admin.email, matchingUser?.id);

      const privacy = {
        showEmail: admin.privacy ? admin.privacy.showEmail : (matchingUser?.privacy ? matchingUser.privacy.showEmail : fallback.showEmail),
        showLikedPosts: admin.privacy ? admin.privacy.showLikedPosts : (matchingUser?.privacy ? matchingUser.privacy.showLikedPosts : fallback.showLikedPosts),
      };

      if (fallback.showEmail === false) privacy.showEmail = false;
      if (fallback.showLikedPosts === false) privacy.showLikedPosts = false;

      const responsePayload = {
        ...admin,
        avatar: admin.avatar || generateAvatarUrl(admin.fullName, admin.username),
        bio: 'Platform Administrator',
        website: '',
        location: 'Global',
        type: 'admin',
        showEmail: privacy.showEmail,
        showLikedPosts: privacy.showLikedPosts,
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
          privacy: {
            select: { showEmail: true, showLikedPosts: true },
          },
        },
      }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const matchingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: user.email },
          { username: user.username },
        ],
      },
      select: {
        id: true,
        privacy: {
          select: { showEmail: true, showLikedPosts: true },
        },
      },
    });

    const fallback = getPrivacy(userId, user.username, user.email, matchingAdmin?.id);

    const privacy = {
      showEmail: user.privacy ? user.privacy.showEmail : (matchingAdmin?.privacy ? matchingAdmin.privacy.showEmail : fallback.showEmail),
      showLikedPosts: user.privacy ? user.privacy.showLikedPosts : (matchingAdmin?.privacy ? matchingAdmin.privacy.showLikedPosts : fallback.showLikedPosts),
    };

    if (fallback.showEmail === false) privacy.showEmail = false;
    if (fallback.showLikedPosts === false) privacy.showLikedPosts = false;

    const responsePayload = {
      ...user,
      avatar: user.avatar || generateAvatarUrl(user.fullName, user.username),
      type: 'user',
      showEmail: privacy.showEmail,
      showLikedPosts: privacy.showLikedPosts,
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
