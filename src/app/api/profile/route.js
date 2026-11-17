import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/nextauth-combined';
import { userProfileCache } from '@/lib/cache';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Sanitize input fields
    const data = {};
    if (typeof body.fullName === 'string' && body.fullName.trim()) {
      data.fullName = body.fullName.trim();
    }
    if (typeof body.username === 'string' && body.username.trim()) {
      const sanitizedUsername = body.username.trim().toLowerCase();
      // Check if username is taken by someone else
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
    if (typeof body.avatar === 'string') data.avatar = body.avatar.trim();

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

    // Invalidate LRU cache for immediate consistency
    userProfileCache.delete(userId);

    return NextResponse.json({ user, message: 'Profile updated successfully' });
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

    // Soft delete: deactivate user and scramble credentials to free unique constraints
    const timestamp = Date.now();
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${timestamp}_${Math.random().toString(36).substring(2, 8)}@deleted.local`,
        username: `deleted_${timestamp}`,
      },
    });

    // Purge cache
    userProfileCache.delete(userId);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (e) {
    console.error('Failed to delete account:', e);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
