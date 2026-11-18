import { prisma } from '@/lib/db';

// In-memory cache for fast synchronous reads
const privacyCache = {};

/**
 * Get privacy settings for a user (fast synchronous lookup with cache fallback).
 * @param {...(string|string[])} keys 
 * @returns {{ showEmail: boolean, showLikedPosts: boolean }}
 */
export function getPrivacy(...keys) {
  const flattened = keys.flat().filter(Boolean);
  if (flattened.length === 0) return { showEmail: true, showLikedPosts: true };

  let showEmail = true;
  let showLikedPosts = true;

  for (const k of flattened) {
    const entry = privacyCache[k];
    if (entry) {
      if (entry.showEmail === false) showEmail = false;
      if (entry.showLikedPosts === false) showLikedPosts = false;
    }
  }

  return { showEmail, showLikedPosts };
}

/**
 * Asynchronously fetch privacy settings directly from Prisma database via foreign keys.
 * @param {string} userIdOrAdminId 
 * @param {string[]} [aliases=[]]
 */
export async function fetchPrivacyFromDB(userIdOrAdminId, aliases = []) {
  const allKeys = Array.from(new Set([userIdOrAdminId, ...aliases].filter(Boolean)));
  if (allKeys.length === 0) return { showEmail: true, showLikedPosts: true };

  try {
    const record = await prisma.userPrivacy.findFirst({
      where: {
        OR: [
          { userId: { in: allKeys } },
          { adminId: { in: allKeys } },
        ],
      },
    });

    if (record) {
      const res = {
        showEmail: record.showEmail !== false,
        showLikedPosts: record.showLikedPosts !== false,
      };

      // Sync into memory cache
      for (const k of allKeys) {
        privacyCache[k] = { ...res, updatedAt: record.updatedAt.toISOString() };
      }

      return res;
    }
  } catch (err) {
    console.error('Notice: Could not fetch privacy from Prisma DB:', err.message);
  }

  return getPrivacy(...allKeys);
}

/**
 * Update privacy settings in Prisma PostgreSQL database using UserPrivacy model
 * with foreign key constraints linking to User and Admin, while updating the cache.
 * @param {string} id 
 * @param {{ showEmail?: boolean, showLikedPosts?: boolean }} settings 
 * @param {string|string[]} [aliases=[]]
 */
export async function setPrivacy(id, settings, aliases = []) {
  if (!id) return;
  const allKeys = Array.from(new Set([id, ...(Array.isArray(aliases) ? aliases : [aliases])].filter(Boolean)));

  const current = getPrivacy(...allKeys);
  const updatedSetting = {
    showEmail: typeof settings.showEmail === 'boolean' ? settings.showEmail : current.showEmail,
    showLikedPosts: typeof settings.showLikedPosts === 'boolean' ? settings.showLikedPosts : current.showLikedPosts,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update in-memory cache
  for (const k of allKeys) {
    privacyCache[k] = { ...updatedSetting };
  }

  // 2. Persist to Prisma DB using foreign keys to User and Admin
  try {
    const [userRecord, adminRecord] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [
            { id: { in: allKeys } },
            { email: { in: allKeys } },
            { username: { in: allKeys } },
          ],
        },
        select: { id: true },
      }),
      prisma.admin.findFirst({
        where: {
          OR: [
            { id: { in: allKeys } },
            { email: { in: allKeys } },
            { username: { in: allKeys } },
          ],
        },
        select: { id: true },
      }),
    ]);

    const targetUserId = userRecord?.id || null;
    const targetAdminId = adminRecord?.id || null;

    if (targetUserId || targetAdminId) {
      // Find existing privacy row by userId or adminId
      const existing = await prisma.userPrivacy.findFirst({
        where: {
          OR: [
            ...(targetUserId ? [{ userId: targetUserId }] : []),
            ...(targetAdminId ? [{ adminId: targetAdminId }] : []),
          ],
        },
      });

      if (existing) {
        await prisma.userPrivacy.update({
          where: { id: existing.id },
          data: {
            showEmail: updatedSetting.showEmail,
            showLikedPosts: updatedSetting.showLikedPosts,
            userId: targetUserId || existing.userId,
            adminId: targetAdminId || existing.adminId,
          },
        });
      } else {
        await prisma.userPrivacy.create({
          data: {
            userId: targetUserId,
            adminId: targetAdminId,
            showEmail: updatedSetting.showEmail,
            showLikedPosts: updatedSetting.showLikedPosts,
          },
        });
      }
    }
  } catch (err) {
    console.error('Notice: Could not write privacy to Prisma DB:', err.message);
  }

  return updatedSetting;
}
