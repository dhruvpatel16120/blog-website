import { prisma } from '@/lib/db';

export async function recordAudit({ userId, action, entity, entityId, metadata }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (e) {
    // avoid throwing in audit helper
    console.error('Audit log error:', e);
  }
}


