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
 * Generate automatic identicon avatar URL based on user's username/name
 * Uses Dicebear identicon with custom pastel backgrounds (as used in dummy seed and admin dashboard)
 * @param {string} fullName - User's full name
 * @param {string} username - User's username
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(fullName, username) {
  const seed = (username?.trim() || fullName?.trim() || 'user').toLowerCase();
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/**
 * Generate custom identicon avatar URL
 */
export function generateCustomAvatarUrl(fullName, username) {
  return generateAvatarUrl(fullName, username);
}

/**
 * Generate avatar for existing users who don't have one
 */
export function generateAvatarForExistingUser(fullName, username) {
  return generateAvatarUrl(fullName, username);
}
