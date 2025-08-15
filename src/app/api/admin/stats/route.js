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
      totalContacts,
      pendingContacts,
      respondedContacts,
      spamContacts,
      archivedContacts,
      highPriorityContacts,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.comment.count({ where: { approved: true } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'PENDING' } }),
      prisma.contact.count({ where: { status: 'RESPONDED' } }),
      prisma.contact.count({ where: { status: 'SPAM' } }),
      prisma.contact.count({ where: { status: 'ARCHIVED' } }),
      prisma.contact.count({ where: { priority: { in: ['HIGH', 'URGENT'] } } }),
    ]);

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      take: 8,
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

    // Get all categories with post counts
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts: Math.max(totalPosts - publishedPosts, 0),
        totalUsers,
        totalComments,
        pendingComments,
        approvedComments,
        totalCategories,
        totalTags,
        totalContacts,
        pendingContacts,
        respondedContacts,
        spamContacts,
        archivedContacts,
        highPriorityContacts,
        recentPosts,
        categories,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
