import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { generateAvatarForExistingUser } from '@/lib/utils';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all users without avatars
    const usersWithoutAvatars = await prisma.user.findMany({
      where: {
        OR: [
          { avatar: null },
          { avatar: '' }
        ]
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        avatar: true
      }
    });

    if (usersWithoutAvatars.length === 0) {
      return NextResponse.json({ 
        message: 'All users already have avatars',
        updatedCount: 0 
      });
    }

    // Generate avatars for users without them
    const updatePromises = usersWithoutAvatars.map(user => {
      const avatarUrl = generateAvatarForExistingUser(user.fullName, user.username);
      return prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatarUrl }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: `Generated avatars for ${usersWithoutAvatars.length} users`,
      updatedCount: usersWithoutAvatars.length,
      users: usersWithoutAvatars.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }))
    });

  } catch (error) {
    console.error('Error generating avatars:', error);
    return NextResponse.json({ error: 'Failed to generate avatars' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count users without avatars
    const usersWithoutAvatars = await prisma.user.count({
      where: {
        OR: [
          { avatar: null },
          { avatar: '' }
        ]
      }
    });

    const totalUsers = await prisma.user.count();

    return NextResponse.json({ 
      usersWithoutAvatars,
      totalUsers,
      usersWithAvatars: totalUsers - usersWithoutAvatars
    });

  } catch (error) {
    console.error('Error counting users without avatars:', error);
    return NextResponse.json({ error: 'Failed to count users' }, { status: 500 });
  }
}
