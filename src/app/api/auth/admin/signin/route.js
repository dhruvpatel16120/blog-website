import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
// Legacy cookie guard removed. Use NextAuth instead; keep compatibility header no-op.

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin || !admin.password || !admin.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked' },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = admin.loginAttempts + 1;
      const updateData = { loginAttempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await prisma.admin.update({ where: { id: admin.id }, data: updateData });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Reset login attempts on successful login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date(), loginAttempts: 0, lockedUntil: null }
    });

    const res = NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        avatar: admin.avatar,
        role: admin.role,
        type: 'admin'
      }
    });

    // No legacy cookie; NextAuth session is the source of truth.

    return res;
  } catch (error) {
    console.error('Admin signin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
