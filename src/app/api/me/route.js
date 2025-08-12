import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { userAuthOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(userAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, postCount, commentCount, likeCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    }),
    prisma.post.count({ where: { authorId: session.user.id } }),
    prisma.comment.count({ where: { authorId: session.user.id } }),
    prisma.like.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ ...user, stats: { postCount, commentCount, likeCount } });
}


