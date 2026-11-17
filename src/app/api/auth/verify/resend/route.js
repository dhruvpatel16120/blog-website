import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import emailService from '@/lib/email-service';
import { rateLimitCache } from '@/lib/cache';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rateLimitKey = `resend_verify:${ip}`;
    const attempts = rateLimitCache.get(rateLimitKey) || 0;
    if (attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many resend requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }
    rateLimitCache.set(rateLimitKey, attempts + 1, 300000); // 5 min window

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, isActive: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with that email, a verification link has been sent.' }
      );
    }

    if (user.isActive && user.emailVerified) {
      return NextResponse.json({
        alreadyVerified: true,
        message: 'Your email is already verified. You can sign in directly.',
      });
    }

    // Delete existing unused tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    }).catch(() => {});

    // Create fresh token
    const token = emailService.generateVerificationToken();
    await emailService.createVerificationToken(cleanEmail, token);

    // Send email
    try {
      await emailService.sendVerificationEmail(cleanEmail, token);
    } catch (err) {
      console.warn('Email sending failed in development:', err);
    }

    return NextResponse.json({
      success: true,
      message: `A fresh verification link has been sent to ${cleanEmail}.`,
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
