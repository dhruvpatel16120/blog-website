import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTotalViews } from '@/lib/views';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

export async function GET() {
  try {
    // Enforce server-side admin auth for security
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get counts from database
    const [
      totalPosts,
      totalUsers,
      totalComments,
      totalCategories,
      totalTags
    ] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.tag.count()
    ]);

    // Get total views from PageView table
    const totalViews = await getTotalViews();

    return NextResponse.json({
      totalPosts,
      totalUsers,
      totalComments,
      totalCategories,
      totalTags,
      totalViews
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
