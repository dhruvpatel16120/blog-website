import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

// GET - Fetch single post for editing
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updatedPost = await prisma.post.update({
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    // Transform the data to match frontend expectations
    const transformedPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      status: updatedPost.published ? 'published' : 'draft',
      coverImage: updatedPost.coverImage,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      author: updatedPost.author,
      category: updatedPost.category,
      tags: updatedPost.tags.map(pt => pt.tag),
      viewCount: updatedPost.viewCount || 0,
      commentCount: updatedPost._count.comments,
      likeCount: updatedPost._count.likes
    };

    return NextResponse.json(transformedPost);

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if post has any comments
    const postWithComments = await prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (postWithComments._count.comments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete post with existing comments' },
        { status: 400 }
      );
    }

    // Delete post tags first
    await prisma.postTag.deleteMany({
      where: { postId: id }
    });

    // Delete the post
    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
