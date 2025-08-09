import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: body,
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
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user has any posts or comments
    const userWithContent = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    if (userWithContent._count.posts > 0 || userWithContent._count.comments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing posts or comments' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
