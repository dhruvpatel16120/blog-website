import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real-time statistics
    const [
      totalPosts,
      totalUsers,
      totalCategories,
      totalTags,
      totalViews,
      totalLikes,
      totalComments,
      totalContacts,
      recentPosts,
      recentUsers,
      recentComments,
      recentContacts
    ] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.post.aggregate({
        _sum: { viewCount: true }
      }),
      prisma.like.count({
        where: { postId: { not: null } }
      }),
      prisma.comment.count(),
      prisma.contact.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, email: true, createdAt: true }
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { 
          author: { select: { name: true } },
          post: { select: { title: true } }
        }
      }),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate percentage changes (mock for now - you can implement real tracking)
    const stats = [
      {
        name: 'Total Posts',
        value: totalPosts.toString(),
        change: '+12%',
        changeType: 'positive',
        icon: 'DocumentTextIcon',
      },
      {
        name: 'Total Users',
        value: totalUsers.toString(),
        change: '+8%',
        changeType: 'positive',
        icon: 'UsersIcon',
      },
      {
        name: 'Categories',
        value: totalCategories.toString(),
        change: '+2',
        changeType: 'positive',
        icon: 'FolderIcon',
      },
      {
        name: 'Tags',
        value: totalTags.toString(),
        change: '+6',
        changeType: 'positive',
        icon: 'TagIcon',
      },
      {
        name: 'Total Views',
        value: (totalViews._sum.viewCount || 0).toLocaleString(),
        change: '+18%',
        changeType: 'positive',
        icon: 'EyeIcon',
      },
      {
        name: 'Total Likes',
        value: totalLikes.toString(),
        change: '+24%',
        changeType: 'positive',
        icon: 'HeartIcon',
      },
      {
        name: 'Comments',
        value: totalComments.toString(),
        change: '+15%',
        changeType: 'positive',
        icon: 'ChatBubbleLeftIcon',
      },
      {
        name: 'Contact Messages',
        value: totalContacts.toString(),
        change: '+3',
        changeType: 'neutral',
        icon: 'EnvelopeIcon',
      },
    ];

    const recentActivity = [
      ...recentPosts.map(post => ({
        id: post.id,
        type: 'post',
        action: 'New post published',
        title: post.title,
        author: post.author.name || 'Anonymous',
        time: getTimeAgo(post.createdAt),
      })),
      ...recentUsers.map(user => ({
        id: user.email,
        type: 'user',
        action: 'New user registered',
        title: user.email,
        author: user.name || 'Anonymous',
        time: getTimeAgo(user.createdAt),
      })),
      ...recentComments.map(comment => ({
        id: comment.id,
        type: 'comment',
        action: 'New comment on post',
        title: comment.content.substring(0, 50) + '...',
        author: comment.author.name || 'Anonymous',
        time: getTimeAgo(comment.createdAt),
        postTitle: comment.post.title,
      })),
      ...recentContacts.map(contact => ({
        id: contact.id,
        type: 'contact',
        action: 'New contact message',
        title: contact.subject || 'No subject',
        author: contact.name,
        time: getTimeAgo(contact.createdAt),
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    return NextResponse.json({ stats, recentActivity });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
