import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalPosts,
      publishedPosts,
      totalUsers,
      totalComments,
      pendingComments,
      approvedComments,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.comment.count({ where: { approved: true } }),
      prisma.category.count(),
      prisma.tag.count(),
    ]);

    // Get recent comments
    const recentComments = await prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
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

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        totalUsers,
        totalComments,
        pendingComments,
        approvedComments,
        totalCategories,
        totalTags,
      },
      recentComments,
      recentPosts,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
