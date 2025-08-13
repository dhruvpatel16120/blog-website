import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import emailService from '@/lib/email-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Use email service to verify token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
    }

    // Update user to verified and active
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { 
        emailVerified: new Date(),
        isActive: true // Activate the user after email verification
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


