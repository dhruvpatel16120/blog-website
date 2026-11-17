import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'sidebar-settings.json');

const DEFAULT_SETTINGS = {
  categoriesCount: 6,
  tagsCount: 12,
};

let settingsCache = null;

function ensureSettingsFile() {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
      settingsCache = { ...DEFAULT_SETTINGS };
    }
  } catch (err) {
    console.error('Error ensuring sidebar settings file:', err);
  }
}

/**
 * Get sidebar settings
 * @returns {{ categoriesCount: number, tagsCount: number }}
 */
export function getSidebarSettings() {
  if (settingsCache !== null) return settingsCache;
  ensureSettingsFile();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      settingsCache = {
        categoriesCount: Math.max(1, Math.min(50, Number(parsed.categoriesCount) || DEFAULT_SETTINGS.categoriesCount)),
        tagsCount: Math.max(1, Math.min(100, Number(parsed.tagsCount) || DEFAULT_SETTINGS.tagsCount)),
      };
      return settingsCache;
    }
  } catch (err) {
    console.error('Error reading sidebar settings:', err);
  }
  settingsCache = { ...DEFAULT_SETTINGS };
  return settingsCache;
}

/**
 * Save sidebar settings
 * @param {{ categoriesCount?: number, tagsCount?: number }} newSettings 
 */
export function setSidebarSettings(newSettings) {
  const current = getSidebarSettings();
  const updated = {
    categoriesCount: Math.max(1, Math.min(50, Number(newSettings.categoriesCount) || current.categoriesCount)),
    tagsCount: Math.max(1, Math.min(100, Number(newSettings.tagsCount) || current.tagsCount)),
    updatedAt: new Date().toISOString(),
  };

  settingsCache = updated;

  try {
    ensureSettingsFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing sidebar settings:', err);
  }

  return updated;
}
