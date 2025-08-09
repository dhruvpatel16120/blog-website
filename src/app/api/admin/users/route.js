import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    // Transform the data to include post and comment counts
    const transformedUsers = users.map(user => ({
      ...user,
      postCount: user._count.posts,
      commentCount: user._count.comments,
      _count: undefined // Remove the _count object
    }));

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, role } = await request.json();
  if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 });
  const allowed = ['USER', 'MODERATOR', 'ADMIN'];
  if (!allowed.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ message: 'Updated' });
}


