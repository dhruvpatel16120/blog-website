import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: body,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      isApproved: updatedComment.isApproved || false,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      author: updatedComment.author,
      post: updatedComment.post
    };

    return NextResponse.json(transformedComment);

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if comment has any replies
    const commentWithReplies = await prisma.comment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (commentWithReplies._count.replies > 0) {
      return NextResponse.json(
        { error: 'Cannot delete comment with existing replies' },
        { status: 400 }
      );
    }

    await prisma.comment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
