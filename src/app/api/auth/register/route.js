import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import emailService from '@/lib/email-service';
import { rateLimitCache } from '@/lib/cache';
import { generateAvatarUrl } from '@/lib/utils';

export async function POST(request) {
  try {
    // Basic IP-based sliding window rate limit (DSA Map cache)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateLimitKey = `register:${ip}`;
    const attempts = rateLimitCache.get(rateLimitKey) || 0;
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }
    rateLimitCache.set(rateLimitKey, attempts + 1, 600000); // 10 min window

    const body = await request.json();
    const { username, email, fullName, password, bio, website, location } = body;

    // Validate required fields
    if (!username || !email || !fullName || !password) {
      return NextResponse.json(
        { error: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    // Regex checks
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters long and contain only letters, numbers, hyphens, and underscores.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Parallel check for existing username and email
    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findUnique({
        where: { username: cleanUsername },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true },
      }),
    ]);

    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }

    if (existingEmail) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    // Hash password with salt rounds = 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if SMTP is configured
    const hasEmailConfig = Boolean(process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD);

    // Create user (auto-active if no email server configured in dev/testing, otherwise requires verification)
    const isAutoActive = !hasEmailConfig;

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        fullName: cleanFullName,
        password: hashedPassword,
        avatar: generateAvatarUrl(cleanFullName, cleanUsername),
        bio: (bio || '').trim(),
        website: (website || '').trim(),
        location: (location || '').trim(),
        isActive: isAutoActive,
        emailVerified: isAutoActive ? new Date() : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        website: true,
        location: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (hasEmailConfig) {
      try {
        const verificationToken = emailService.generateVerificationToken();
        await emailService.createVerificationToken(cleanEmail, verificationToken);
        await emailService.sendVerificationEmail(cleanEmail, verificationToken);
        return NextResponse.json({
          message: 'Account created! Please check your email to verify your account.',
          requiresVerification: true,
          user,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Fallback: activate user if mail delivery failed so user is not permanently stuck
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: true },
        });
        return NextResponse.json({
          message: 'Account created successfully! You can now sign in.',
          requiresVerification: false,
          user,
        });
      }
    }

    return NextResponse.json({
      message: 'Account created successfully! You can now sign in.',
      requiresVerification: false,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
