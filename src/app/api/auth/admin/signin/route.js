import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { rateLimitCache } from '@/lib/cache';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateLimitKey = `admin_login:${ip}`;
    const attempts = rateLimitCache.get(rateLimitKey) || 0;
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait before retrying.' },
        { status: 429 }
      );
    }

    const { email, username, password } = await request.json();
    const identifier = (email || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Admin email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email or username
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!admin || !admin.password || !admin.isActive) {
      rateLimitCache.set(rateLimitKey, attempts + 1, 300000);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to excessive failed attempts.' },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      const newAttempts = (admin.loginAttempts || 0) + 1;
      const updateData = { loginAttempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await prisma.admin.update({ where: { id: admin.id }, data: updateData });
      rateLimitCache.set(rateLimitKey, attempts + 1, 300000);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Reset login attempts on successful login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date(), loginAttempts: 0, lockedUntil: null },
    });
    rateLimitCache.delete(rateLimitKey);

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        avatar: admin.avatar,
        role: admin.role,
        type: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin signin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
