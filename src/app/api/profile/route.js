import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';
import { userProfileCache } from '@/lib/cache';
import { setPrivacy, getPrivacy } from '@/lib/privacy';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.type === 'admin';
    const body = await request.json();

    // Sanitize input fields
    const data = {};
    if (typeof body.fullName === 'string' && body.fullName.trim()) {
      data.fullName = body.fullName.trim();
    }
    if (typeof body.avatar === 'string') {
      data.avatar = body.avatar.trim();
    }

    // Admin profile update
    if (isAdmin) {
      if (typeof body.username === 'string' && body.username.trim()) {
        const cleanUsername = body.username.trim().toLowerCase();
        const conflict = await prisma.admin.findFirst({
          where: {
            username: cleanUsername,
            NOT: { id: userId },
          },
          select: { id: true },
        });
        if (conflict) {
          return NextResponse.json({ error: 'Username is already in use by another administrator' }, { status: 409 });
        }
        data.username = cleanUsername;
      }

      // Update privacy preferences if provided
      let privacy = getPrivacy(userId);
      if (typeof body.showEmail === 'boolean' || typeof body.showLikedPosts === 'boolean') {
        const matchingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: session.user.email },
              { username: session.user.username },
            ],
          },
          select: { id: true },
        });

        const aliases = [
          session.user.email,
          session.user.username,
          matchingUser?.id,
        ].filter(Boolean);

        await setPrivacy(userId, {
          showEmail: body.showEmail,
          showLikedPosts: body.showLikedPosts,
        }, aliases);

        if (matchingUser?.id) {
          userProfileCache.delete(matchingUser.id);
        }

        privacy = getPrivacy(userId, aliases);
      }

      const admin = await prisma.admin.update({
        where: { id: userId },
        data,
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
      });

      userProfileCache.delete(userId);
      return NextResponse.json({
        user: { ...admin, type: 'admin', showEmail: privacy.showEmail, showLikedPosts: privacy.showLikedPosts },
        message: 'Admin profile updated successfully',
      });
    }

    // Normal User profile update
    if (typeof body.username === 'string' && body.username.trim()) {
      const sanitizedUsername = body.username.trim().toLowerCase();
      const conflict = await prisma.user.findFirst({
        where: {
          username: sanitizedUsername,
          NOT: { id: userId },
        },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
      data.username = sanitizedUsername;
    }
    if (typeof body.bio === 'string') data.bio = body.bio.trim();
    if (typeof body.website === 'string') data.website = body.website.trim();
    if (typeof body.location === 'string') data.location = body.location.trim();

    // Update privacy preferences if provided
    let privacy = getPrivacy(userId);
    if (typeof body.showEmail === 'boolean' || typeof body.showLikedPosts === 'boolean') {
      const matchingAdmin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email: session.user.email },
            { username: session.user.username },
          ],
        },
        select: { id: true },
      });

      const aliases = [
        session.user.email,
        session.user.username,
        matchingAdmin?.id,
      ].filter(Boolean);

      await setPrivacy(userId, {
        showEmail: body.showEmail,
        showLikedPosts: body.showLikedPosts,
      }, aliases);

      if (matchingAdmin?.id) {
        userProfileCache.delete(matchingAdmin.id);
      }

      privacy = getPrivacy(userId, aliases);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
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
    });

    userProfileCache.delete(userId);

    return NextResponse.json({
      user: {
        ...user,
        type: 'user',
        showEmail: privacy.showEmail,
        showLikedPosts: privacy.showLikedPosts,
      },
      message: 'Profile updated successfully',
    });
  } catch (e) {
    console.error('Failed to update profile:', e);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.type === 'admin';

    if (isAdmin) {
      return NextResponse.json(
        { error: 'Administrator accounts cannot be self-deleted. Contact super-admin.' },
        { status: 403 }
      );
    }

    // Soft delete normal user
    const timestamp = Date.now();
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${timestamp}_${Math.random().toString(36).substring(2, 8)}@deleted.local`,
        username: `deleted_${timestamp}`,
      },
    });

    userProfileCache.delete(userId);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (e) {
    console.error('Failed to delete account:', e);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
