// Application Constants
export const APP_NAME = 'Tech Blog';
export const APP_DESCRIPTION = 'A modern tech blog built with Next.js';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Pagination
export const POSTS_PER_PAGE = 12;
export const COMMENTS_PER_PAGE = 10;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Rate Limiting
export const RATE_LIMIT_MAX = 100;
export const RATE_LIMIT_WINDOW_MS = 900000; // 15 minutes

// Session
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Contact Form
export const CONTACT_SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Partnership',
  'Feedback',
  'Other'
];

// Social Media
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/techblog',
  linkedin: 'https://linkedin.com/company/techblog',
  github: 'https://github.com/techblog',
  email: 'contact@techblog.com'
};
