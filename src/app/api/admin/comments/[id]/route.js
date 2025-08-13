import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// PUT /api/admin/comments/[id] - Update comment (approve/reject)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { approved, content } = await request.json();

    const updateData = {};
    if (typeof approved === 'boolean') {
      updateData.approved = approved;
    }
    if (content) {
      updateData.content = content.trim();
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error updating admin comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/admin/comments/[id] - Delete comment
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First, check if the comment exists and get its details
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if comment has replies - if so, delete them first
    if (comment._count.replies > 0) {
      // Delete all replies first (cascade delete)
      await prisma.comment.deleteMany({
        where: { parentId: id },
      });
    }

    // Delete the main comment
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Comment deleted successfully',
      deletedReplies: comment._count.replies 
    });
  } catch (error) {
    console.error('Error deleting admin comment:', error);
    
    // Handle specific database errors
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
