import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { generateCustomAvatarUrl } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent privilege escalation - only ADMIN users can assign ADMIN role
    if (typeof body.role !== 'undefined') {
      const allowed = ['USER', 'ADMIN'];
      if (!allowed.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      if (body.role === 'ADMIN' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
      }
    }

    // Never allow raw password updates via this endpoint
    if (typeof body.password !== 'undefined') {
      return NextResponse.json({ error: 'Password updates are not allowed via this endpoint' }, { status: 400 });
    }

    // If updating username or email, enforce uniqueness
    if (typeof body.username === 'string' && body.username.length >= 3) {
      const exists = await prisma.user.findUnique({ where: { username: body.username } });
      if (exists && exists.id !== id) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }
    if (typeof body.email === 'string') {
      const exists = await prisma.user.findUnique({ where: { email: body.email } });
      if (exists && exists.id !== id) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Whitelist updatable fields
    const allowedFields = ['username', 'email', 'fullName', 'avatar', 'bio', 'website', 'location', 'role', 'isActive'];
    const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowedFields.includes(k)));

    // Generate avatar if updating name and no avatar exists
    if ((body.fullName || body.username) && !data.avatar) {
      const currentUser = await prisma.user.findUnique({ where: { id }, select: { fullName: true, username: true, avatar: true } });
      if (!currentUser.avatar) {
        data.avatar = generateCustomAvatarUrl(body.fullName || currentUser.fullName, body.username || currentUser.username);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion of own user if mapped to a user account with same email
    if (session.user.email) {
      const maybeSelf = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (maybeSelf && maybeSelf.id === id) {
        return NextResponse.json({ error: 'Admins cannot delete their own linked user account' }, { status: 400 });
      }
    }

    // Prevent deleting the user currently associated to posts/comments unless reassigned
    const userWithContent = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, comments: true } }
      }
    });

    if (!userWithContent) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userWithContent._count.posts > 0 || userWithContent._count.comments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing posts or comments' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
