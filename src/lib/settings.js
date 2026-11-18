import { prisma } from '@/lib/db';
import { publicDataCache } from '@/lib/cache';

export const DEFAULT_BLOG_SETTINGS = {
  postsPerPage: 9,
  homeFeaturedCount: 6,
  homeTrendingCount: 6,
  homeLatestCount: 9,
  categoriesLimit: 6,
  tagsLimit: 12,
  categoriesCount: 6,
  tagsCount: 12,
};

let settingsCache = null;

/**
 * Synchronous getBlogSettings using in-memory cache.
 * Returns cached settings or defaults. Instantaneous (0ms) lookup.
 */
export function getBlogSettings() {
  if (settingsCache !== null) return settingsCache;
  return { ...DEFAULT_BLOG_SETTINGS };
}

/**
 * Asynchronously fetch settings directly from PostgreSQL database.
 */
export async function fetchBlogSettings() {
  try {
    const record = await prisma.blogSetting.findUnique({
      where: { id: 'default' },
    });

    if (record) {
      const updated = {
        postsPerPage: record.postsPerPage ?? DEFAULT_BLOG_SETTINGS.postsPerPage,
        homeFeaturedCount: record.homeFeaturedCount ?? DEFAULT_BLOG_SETTINGS.homeFeaturedCount,
        homeTrendingCount: record.homeTrendingCount ?? DEFAULT_BLOG_SETTINGS.homeTrendingCount,
        homeLatestCount: record.homeLatestCount ?? DEFAULT_BLOG_SETTINGS.homeLatestCount,
        categoriesLimit: record.categoriesLimit ?? DEFAULT_BLOG_SETTINGS.categoriesLimit,
        tagsLimit: record.tagsLimit ?? DEFAULT_BLOG_SETTINGS.tagsLimit,
        categoriesCount: record.categoriesLimit ?? DEFAULT_BLOG_SETTINGS.categoriesLimit,
        tagsCount: record.tagsLimit ?? DEFAULT_BLOG_SETTINGS.tagsLimit,
      };
      settingsCache = updated;
      return updated;
    }
  } catch (err) {
    console.error('Notice: Could not fetch blog settings from PostgreSQL:', err.message);
  }

  return getBlogSettings();
}

/**
 * Save blog settings directly to PostgreSQL database.
 */
export async function updateBlogSettings(newSettings) {
  const current = getBlogSettings();
  const updated = {
    postsPerPage: Math.max(1, Math.min(50, Number(newSettings.postsPerPage) || current.postsPerPage)),
    homeFeaturedCount: Math.max(1, Math.min(24, Number(newSettings.homeFeaturedCount) || current.homeFeaturedCount)),
    homeTrendingCount: Math.max(1, Math.min(24, Number(newSettings.homeTrendingCount) || current.homeTrendingCount)),
    homeLatestCount: Math.max(1, Math.min(36, Number(newSettings.homeLatestCount) || current.homeLatestCount)),
    categoriesLimit: Math.max(1, Math.min(50, Number(newSettings.categoriesLimit) || Number(newSettings.categoriesCount) || current.categoriesLimit)),
    tagsLimit: Math.max(1, Math.min(100, Number(newSettings.tagsLimit) || Number(newSettings.tagsCount) || current.tagsLimit)),
  };

  updated.categoriesCount = updated.categoriesLimit;
  updated.tagsCount = updated.tagsLimit;
  updated.updatedAt = new Date().toISOString();

  settingsCache = updated;

  // Persist directly to PostgreSQL database
  try {
    await prisma.blogSetting.upsert({
      where: { id: 'default' },
      update: {
        postsPerPage: updated.postsPerPage,
        homeFeaturedCount: updated.homeFeaturedCount,
        homeTrendingCount: updated.homeTrendingCount,
        homeLatestCount: updated.homeLatestCount,
        categoriesLimit: updated.categoriesLimit,
        tagsLimit: updated.tagsLimit,
      },
      create: {
        id: 'default',
        postsPerPage: updated.postsPerPage,
        homeFeaturedCount: updated.homeFeaturedCount,
        homeTrendingCount: updated.homeTrendingCount,
        homeLatestCount: updated.homeLatestCount,
        categoriesLimit: updated.categoriesLimit,
        tagsLimit: updated.tagsLimit,
      },
    });
  } catch (err) {
    console.error('Notice: Could not write blog settings to PostgreSQL database:', err.message);
  }

  // Invalidate any in-memory public data caches
  try {
    publicDataCache.delete('sidebar_data');
    publicDataCache.delete('home_data');
    publicDataCache.delete('categories_data');
    publicDataCache.delete('tags_data');
  } catch {
    // ignore
  }

  return updated;
}

/**
 * Backward compatibility helpers
 */
export function getSidebarSettings() {
  const s = getBlogSettings();
  return {
    categoriesCount: s.categoriesLimit,
    tagsCount: s.tagsLimit,
  };
}

export function setSidebarSettings(newSettings) {
  return updateBlogSettings({
    categoriesLimit: newSettings.categoriesCount,
    tagsLimit: newSettings.tagsCount,
  });
}
