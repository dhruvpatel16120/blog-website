import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password too short' }, { status: 400 });

    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt || vt.expires < new Date()) {
      return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email: vt.identifier }, data: { password: hashed } });
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: 'Password updated' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


