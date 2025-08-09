import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    // For admin routes, we rely on client-side session checks
    // The AdminSessionProvider handles authentication on the client side

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get analytics data
    const [
      postsByDate,
      viewsByDate,
      topPosts,
      topCategories,
      userGrowth,
      engagementMetrics
    ] = await Promise.all([
      // Posts created by date
      prisma.post.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: { id: true }
      }),
      
      // Views by date (mock data for now - implement real view tracking)
      getMockViewsData(startDate, now),
      
      // Top performing posts
      prisma.post.findMany({
        take: 10,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          slug: true,
          publishedAt: true
        }
      }),
      
      // Top categories
      prisma.postCategory.groupBy({
        by: ['categoryId'],
        _count: { postId: true },
        orderBy: { _count: { postId: 'desc' } },
        take: 8
      }),
      
      // User growth
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: { id: true }
      }),
      
      // Engagement metrics
      prisma.$transaction([
        prisma.like.count({ where: { postId: { not: null } } }),
        prisma.comment.count(),
        prisma.post.aggregate({ _avg: { viewCount: true } })
      ])
    ]);

    // Process posts by date
    const postsData = postsByDate.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      posts: item._count.id
    }));
    const totalPostsCount = postsByDate.reduce((sum, item) => sum + (item._count?.id || 0), 0);

    // Process user growth
    const userData = userGrowth.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      users: item._count.id
    }));

    // Get category names for top categories
    const categoryIds = topCategories.map(cat => cat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const topCategoriesData = topCategories.map(cat => {
      const category = categories.find(c => c.id === cat.categoryId);
      return {
        name: category?.name || 'Unknown',
        count: cat._count.postId,
        color: category?.color || '#6B7280'
      };
    });

    // Engagement metrics
    const [totalLikes, totalComments, avgViews] = engagementMetrics;

    return NextResponse.json({
      period,
      postsData,
      viewsData: viewsByDate,
      topPosts,
      topCategories: topCategoriesData,
      userData,
      engagement: {
        totalLikes,
        totalComments,
        avgViews: Math.round(avgViews._avg.viewCount || 0),
        engagementRate: totalPostsCount > 0
          ? Number(((totalLikes + totalComments) / totalPostsCount).toFixed(2))
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mock views data - replace with real view tracking
function getMockViewsData(startDate, endDate) {
  const data = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    data.push({
      date: current.toISOString().split('T')[0], 
      views: Math.floor(Math.random() * 1000) + 100
    });
    current.setDate(current.getDate() + 1);
  }
  
  return data;
}
