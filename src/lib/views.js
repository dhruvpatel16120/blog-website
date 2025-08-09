import { prisma } from '@/lib/db';

// Pages that should count views
const VIEW_COUNT_PAGES = [
  '/',
  '/blog',
  '/about',
  '/categories'
];

// Post view pages (dynamic routes)
const POST_VIEW_PATTERN = /^\/blog\/[^\/]+$/;

export async function incrementPageView(pagePath) {
  try {
    // Only count views for specific pages
    if (!VIEW_COUNT_PAGES.includes(pagePath) && !POST_VIEW_PATTERN.test(pagePath)) {
      return;
    }

    // Check if view record exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingView = await prisma.pageView.findFirst({
      where: {
        pagePath,
        date: today
      }
    });

    if (existingView) {
      // Increment existing view count
      await prisma.pageView.update({
        where: { id: existingView.id },
        data: { viewCount: existingView.viewCount + 1 }
      });
    } else {
      // Create new view record
      await prisma.pageView.create({
        data: {
          pagePath,
          date: today,
          viewCount: 1
        }
      });
    }
  } catch (error) {
    console.error('Error incrementing page view:', error);
  }
}

export async function getTotalViews() {
  try {
    const result = await prisma.pageView.aggregate({
      _sum: {
        viewCount: true
      }
    });

    return result._sum.viewCount || 0;
  } catch (error) {
    console.error('Error getting total views:', error);
    return 0;
  }
}

export async function getViewsByPage(pagePath) {
  try {
    const result = await prisma.pageView.aggregate({
      where: { pagePath },
      _sum: {
        viewCount: true
      }
    });

    return result._sum.viewCount || 0;
  } catch (error) {
    console.error('Error getting views by page:', error);
    return 0;
  }
}
