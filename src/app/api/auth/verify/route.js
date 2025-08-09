import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt || vt.expires < new Date()) {
      return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: vt.identifier },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


