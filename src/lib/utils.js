import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content, maxLength = 160) {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + '...'
}

/**
 * Slugify text for URLs
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Generate automatic avatar URL based on user's name
 * @param {string} fullName - User's full name
 * @param {string} username - User's username (fallback if no full name)
 * @param {string} size - Avatar size (default: 200)
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(fullName, username, size = 200) {
  // Use full name if available, otherwise use username
  const name = fullName?.trim() || username?.trim() || 'U';
  
  // Clean the name and get initials
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  // If no initials, use first character of username
  const fallback = initials || username?.charAt(0).toUpperCase() || 'U';
  
  // Generate avatar using UI Avatars service
  const baseUrl = 'https://ui-avatars.com/api';
  const params = new URLSearchParams({
    name: fallback,
    size: size.toString(),
    background: 'random',
    color: 'fff',
    bold: 'true',
    format: 'png'
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a more sophisticated avatar with custom colors
 * @param {string} fullName - User's full name
 * @param {string} username - User's username (fallback if no full name)
 * @param {string} size - Avatar size (default: 200)
 * @returns {string} Avatar URL
 */
export function generateCustomAvatarUrl(fullName, username, size = 200) {
  // Use full name if available, otherwise use username
  const name = fullName?.trim() || username?.trim() || 'U';
  
  // Clean the name and get initials
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  // If no initials, use first character of username
  const fallback = initials || username?.charAt(0).toUpperCase() || 'U';
  
  // Predefined color schemes for better visual appeal
  const colorSchemes = [
    { bg: '1f2937', color: 'fbbf24' }, // Dark gray with amber
    { bg: '059669', color: 'ffffff' }, // Green with white
    { bg: 'dc2626', color: 'ffffff' }, // Red with white
    { bg: '2563eb', color: 'ffffff' }, // Blue with white
    { bg: '7c3aed', color: 'ffffff' }, // Purple with white
    { bg: 'ea580c', color: 'ffffff' }, // Orange with white
    { bg: '0891b2', color: 'ffffff' }, // Cyan with white
    { bg: 'be185d', color: 'ffffff' }, // Pink with white
  ];
  
  // Select color scheme based on name hash for consistency
  const nameHash = name.split('').reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash);
  }, 0);
  const colorScheme = colorSchemes[Math.abs(nameHash) % colorSchemes.length];
  
  // Generate avatar using UI Avatars service with custom colors
  const baseUrl = 'https://ui-avatars.com/api';
  const params = new URLSearchParams({
    name: fallback,
    size: size.toString(),
    background: colorScheme.bg,
    color: colorScheme.color,
    bold: 'true',
    format: 'png'
  });
  
  return `${baseUrl}?${params.toString()}`;
} 

/**
 * Generate avatar for existing users who don't have one
 * This function can be used to bulk update users without avatars
 * @param {string} fullName - User's full name
 * @param {string} username - User's username
 * @param {string} size - Avatar size (default: 200)
 * @returns {string} Avatar URL
 */
export function generateAvatarForExistingUser(fullName, username, size = 200) {
  // Use full name if available, otherwise use username
  const name = fullName?.trim() || username?.trim() || 'U';
  
  // Clean the name and get initials
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  // If no initials, use first character of username
  const fallback = initials || username?.charAt(0).toUpperCase() || 'U';
  
  // Generate avatar using UI Avatars service with consistent colors
  const baseUrl = 'https://ui-avatars.com/api';
  const params = new URLSearchParams({
    name: fallback,
    size: size.toString(),
    background: '6366f1', // Indigo background
    color: 'ffffff',      // White text
    bold: 'true',
    format: 'png'
  });
  
  return `${baseUrl}?${params.toString()}`;
} 