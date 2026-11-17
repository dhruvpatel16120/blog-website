import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import { publicDataCache } from '@/lib/cache';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'blog-settings.json');
const LEGACY_SIDEBAR_FILE = path.join(process.cwd(), 'src', 'data', 'sidebar-settings.json');

export const DEFAULT_BLOG_SETTINGS = {
  postsPerPage: 9,
  homeFeaturedCount: 6,
  homeTrendingCount: 6,
  homeLatestCount: 9,
  categoriesLimit: 6,
  tagsLimit: 12,
};

let settingsCache = null;

function ensureSettingsFile() {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      // Migrate from legacy sidebar file if exists
      let initial = { ...DEFAULT_BLOG_SETTINGS };
      if (fs.existsSync(LEGACY_SIDEBAR_FILE)) {
        try {
          const legacy = JSON.parse(fs.readFileSync(LEGACY_SIDEBAR_FILE, 'utf8') || '{}');
          if (legacy.categoriesCount) initial.categoriesLimit = Number(legacy.categoriesCount);
          if (legacy.tagsCount) initial.tagsLimit = Number(legacy.tagsCount);
        } catch {
          // ignore
        }
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initial, null, 2), 'utf8');
      settingsCache = initial;
    }
  } catch (err) {
    console.error('Error ensuring blog settings file:', err);
  }
}

/**
 * Synchronous getBlogSettings using in-memory cache and local file backup.
 * Instantaneous (0ms) lookup.
 */
export function getBlogSettings() {
  if (settingsCache !== null) return settingsCache;
  ensureSettingsFile();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      settingsCache = {
        postsPerPage: Math.max(1, Math.min(50, Number(parsed.postsPerPage) || DEFAULT_BLOG_SETTINGS.postsPerPage)),
        homeFeaturedCount: Math.max(1, Math.min(24, Number(parsed.homeFeaturedCount) || DEFAULT_BLOG_SETTINGS.homeFeaturedCount)),
        homeTrendingCount: Math.max(1, Math.min(24, Number(parsed.homeTrendingCount) || DEFAULT_BLOG_SETTINGS.homeTrendingCount)),
        homeLatestCount: Math.max(1, Math.min(36, Number(parsed.homeLatestCount) || DEFAULT_BLOG_SETTINGS.homeLatestCount)),
        categoriesLimit: Math.max(1, Math.min(50, Number(parsed.categoriesLimit) || Number(parsed.categoriesCount) || DEFAULT_BLOG_SETTINGS.categoriesLimit)),
        tagsLimit: Math.max(1, Math.min(100, Number(parsed.tagsLimit) || Number(parsed.tagsCount) || DEFAULT_BLOG_SETTINGS.tagsLimit)),
        // Aliases for sidebar compatibility
        categoriesCount: Math.max(1, Math.min(50, Number(parsed.categoriesLimit) || Number(parsed.categoriesCount) || DEFAULT_BLOG_SETTINGS.categoriesLimit)),
        tagsCount: Math.max(1, Math.min(100, Number(parsed.tagsLimit) || Number(parsed.tagsCount) || DEFAULT_BLOG_SETTINGS.tagsLimit)),
      };
      return settingsCache;
    }
  } catch (err) {
    console.error('Error reading blog settings file:', err);
  }
  settingsCache = { 
    ...DEFAULT_BLOG_SETTINGS, 
    categoriesCount: DEFAULT_BLOG_SETTINGS.categoriesLimit, 
    tagsCount: DEFAULT_BLOG_SETTINGS.tagsLimit 
  };
  return settingsCache;
}

/**
 * Asynchronously fetch settings from database (with timeout & fallback).
 */
export async function fetchBlogSettings() {
  try {
    const dbPromise = prisma.blogSetting.findFirst({
      where: { id: 'default' },
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB settings fetch timeout')), 2500)
    );

    const record = await Promise.race([dbPromise, timeoutPromise]);
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
      try {
        ensureSettingsFile();
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
      } catch {
        // ignore disk write error
      }
      return updated;
    }
  } catch (err) {
    // Database asleep or unavailable, fall back safely to cached/file settings
  }

  return getBlogSettings();
}

/**
 * Save blog settings to both database and local JSON cache
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

  // Persist to local JSON file for instant cold-start reads
  try {
    ensureSettingsFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing blog settings to file:', err);
  }

  // Persist to Neon Postgres DB
  try {
    const upsertPromise = prisma.blogSetting.upsert({
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

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB settings save timeout')), 3000)
    );

    await Promise.race([upsertPromise, timeoutPromise]);
  } catch (err) {
    console.error('Notice: Could not write blog settings to database (using file cache):', err.message);
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
