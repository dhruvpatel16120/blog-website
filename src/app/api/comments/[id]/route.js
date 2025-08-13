import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

// PUT /api/comments/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // For admins, check if they own the comment or if they're the admin who created it
    let canEdit = existingComment.authorId === session.user.id;
    
    if (!canEdit && session.user.type === 'admin') {
      // Check if admin created this comment (by email match)
      const commentAuthor = await prisma.user.findUnique({
        where: { id: existingComment.authorId }
      });
      canEdit = commentAuthor && commentAuthor.email === session.user.email;
    }
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/comments/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // For admins, check if they own the comment or if they're the admin who created it
    let canDelete = existingComment.authorId === session.user.id;
    
    if (!canDelete && session.user.type === 'admin') {
      // Check if admin created this comment (by email match)
      const commentAuthor = await prisma.user.findUnique({
        where: { id: existingComment.authorId }
      });
      canDelete = commentAuthor && commentAuthor.email === session.user.email;
    }
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
