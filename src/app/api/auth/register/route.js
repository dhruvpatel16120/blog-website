import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import emailService from '@/lib/email-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, fullName, password, bio, website, location } = body;

    // Validate required fields
    if (!username || !email || !fullName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (initially inactive until email verification)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        bio: bio || '',
        website: website || '',
        location: location || '',
        isActive: false, // User must verify email first
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
      }
    });

    // Generate verification token and send verification email
    try {
      const verificationToken = emailService.generateVerificationToken();
      await emailService.createVerificationToken(email, verificationToken);
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Delete the user if email sending fails
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully. Please check your email to verify your account.',
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}