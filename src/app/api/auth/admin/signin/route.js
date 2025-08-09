import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

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
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

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
      
      // Lock account after 5 failed attempts for 30 minutes
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      await prisma.admin.update({
        where: { id: admin.id },
        data: updateData
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null
      }
    });

    // Return admin data (without password)
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      avatar: admin.avatar,
      role: admin.role,
      permissions: admin.permissions,
      type: 'admin'
    };

    return NextResponse.json({
      success: true,
      admin: adminData
    });

  } catch (error) {
    console.error('Admin signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
