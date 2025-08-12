// Activity/audit tracking removed. Keep no-op exports to avoid breaking imports.
export const IMPORTANT_ACTIVITIES = {};

export async function trackActivity() {
  return;
}

export async function getRecentActivity() {
  return [];
}
