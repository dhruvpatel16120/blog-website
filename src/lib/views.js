import { prisma } from '@/lib/db';

// Best-effort check to avoid hard errors when the page_views table
// hasn't been created yet. Returns true if the table exists.
async function pageViewsTableExists() {
  try {
    const result = await prisma.$queryRaw`SELECT to_regclass('public.page_views') AS reg`;
    const row = Array.isArray(result) ? result[0] : result;
    return Boolean(row && row.reg);
  } catch (error) {
    // If the metadata query itself fails, assume missing
    return false;
  }
}

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

    // If the table hasn't been created, skip silently
    if (!(await pageViewsTableExists())) {
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
    if (!(await pageViewsTableExists())) {
      return 0;
    }
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
    if (!(await pageViewsTableExists())) {
      return 0;
    }
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
