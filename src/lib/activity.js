import { prisma } from '@/lib/db';

// Define important activities that should be tracked
const IMPORTANT_ACTIVITIES = {
  USER_REGISTRATION: 'user_registration',
  POST_PUBLISHED: 'post_published',
  POST_UPDATED: 'post_updated',
  POST_DELETED: 'post_deleted',
  COMMENT_APPROVED: 'comment_approved',
  COMMENT_REJECTED: 'comment_rejected',
  ADMIN_LOGIN: 'admin_login',
  USER_LOGIN: 'user_login',
  SYSTEM_SETTING_CHANGED: 'system_setting_changed'
};

export async function trackActivity(activityData) {
  try {
    const {
      type,
      userId,
      adminId,
      entity,
      entityId,
      metadata = {}
    } = activityData;

    // Only track important activities
    if (!Object.values(IMPORTANT_ACTIVITIES).includes(type)) {
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        adminId,
        action: type,
        entity,
        entityId,
        metadata: JSON.stringify(metadata),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      }
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    throw new Error('Failed to track activity');
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const activities = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true
          }
        },
        admin: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: activity.entity,
      timestamp: activity.createdAt,
      user: activity.user || activity.admin,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : {}
    }));
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw new Error('Failed to get recent activity');
  }
}

export { IMPORTANT_ACTIVITIES };
