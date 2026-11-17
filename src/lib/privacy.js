import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'user-privacy.json');

// In-memory cache for O(1) reads
let privacyCache = null;

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf8');
      privacyCache = {};
    }
  } catch (err) {
    console.error('Error ensuring privacy data file:', err);
  }
}

function loadPrivacyData() {
  if (privacyCache !== null) return privacyCache;
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      privacyCache = JSON.parse(raw || '{}');
      return privacyCache;
    }
  } catch (err) {
    console.error('Error loading privacy data:', err);
  }
  privacyCache = {};
  return privacyCache;
}

/**
 * Get privacy settings for a user
 * @param {string} userId 
 * @returns {{ showEmail: boolean, showLikedPosts: boolean }}
 */
export function getPrivacy(userId) {
  if (!userId) return { showEmail: true, showLikedPosts: true };
  const data = loadPrivacyData();
  const userSettings = data[userId];
  return {
    showEmail: userSettings?.showEmail !== false, // default true
    showLikedPosts: userSettings?.showLikedPosts !== false, // default true
  };
}

/**
 * Update privacy settings for a user
 * @param {string} userId 
 * @param {{ showEmail?: boolean, showLikedPosts?: boolean }} settings 
 */
export function setPrivacy(userId, settings) {
  if (!userId) return;
  const data = loadPrivacyData();
  const current = data[userId] || { showEmail: true, showLikedPosts: true };
  
  data[userId] = {
    showEmail: typeof settings.showEmail === 'boolean' ? settings.showEmail : current.showEmail,
    showLikedPosts: typeof settings.showLikedPosts === 'boolean' ? settings.showLikedPosts : current.showLikedPosts,
    updatedAt: new Date().toISOString(),
  };

  privacyCache = data;

  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving privacy data:', err);
  }

  return data[userId];
}
