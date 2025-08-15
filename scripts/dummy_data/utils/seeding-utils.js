#!/usr/bin/env node

/*
  Common utilities for seeding scripts
  - Database connection management
  - Error handling and logging
  - Data validation
  - Slug generation
  - Content generation helpers
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class SeedingUtils {
  constructor() {
    this.prisma = new PrismaClient();
    this.isConnected = false;
  }

  // Logging functions
  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}${message}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  }

  logSection(message) {
    console.log(`\n${colors.yellow}${colors.bright}${message}${colors.reset}`);
    console.log(`${colors.yellow}${'-'.repeat(message.length)}${colors.reset}`);
  }

  logSuccess(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
  }

  logWarning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  }

  logError(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
  }

  logInfo(message) {
    console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
  }

  // Database connection management
  async connect() {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      this.logSuccess('Database connection established');
      return true;
    } catch (error) {
      this.logError(`Database connection failed: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        this.logSuccess('Database connection closed');
      } catch (error) {
        this.logWarning(`Error closing database connection: ${error.message}`);
      }
    }
  }

  // Data validation
  validateRequiredFields(data, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }

  // Slug generation with collision detection
  async generateUniqueSlug(base, model, field = 'slug') {
    let candidate = base;
    let counter = 1;
    
    while (true) {
      try {
        const exists = await this.prisma[model].findUnique({
          where: { [field]: candidate }
        });
        
        if (!exists) {
          return candidate;
        }
        
        candidate = `${base}-${counter}`;
        counter++;
        
        // Prevent infinite loops
        if (counter > 100) {
          throw new Error(`Could not generate unique slug for: ${base}`);
        }
      } catch (error) {
        throw new Error(`Error checking slug uniqueness: ${error.message}`);
      }
    }
  }

  // Safe slugify function
  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Content generation helpers
  estimateReadTime(content) {
    const words = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
  }

  generateCoverImage(seed) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`;
  }

  generateKeywords(title, tags, maxKeywords = 15) {
    const base = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const allKeywords = [...base, ...tags.map(tag => tag.toLowerCase())];
    return Array.from(new Set(allKeywords)).slice(0, maxKeywords).join(', ');
  }

  // Date utilities
  daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  // User management
  async ensureAuthorUser() {
    try {
      // Try to find an existing user first
      const existingUser = await this.prisma.user.findFirst({
        where: { role: 'USER' },
        orderBy: { createdAt: 'asc' }
      });

      if (existingUser) {
        return existingUser;
      }

      // Create a seed author if none exists
      const hashedPassword = await bcrypt.hash('seed@12345', 12);
      const author = await this.prisma.user.create({
        data: {
          username: 'seed-author',
          email: 'author@techblog.com',
          fullName: 'Tech Blog Author',
          password: hashedPassword,
          bio: 'Professional tech writer and developer advocate.',
          website: 'https://techblog.com',
          location: 'San Francisco, CA',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=seed-author`,
          role: 'USER',
          isActive: true,
          emailVerified: new Date()
        }
      });

      this.logSuccess(`Created seed author: ${author.fullName}`);
      return author;
    } catch (error) {
      throw new Error(`Failed to ensure author user: ${error.message}`);
    }
  }

  // Category management
  async upsertCategory(categoryData) {
    try {
      return await this.prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
          updatedAt: new Date()
        },
        create: {
          slug: categoryData.slug,
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to upsert category ${categoryData.name}: ${error.message}`);
    }
  }

  // Tag management
  async upsertTag(tagData) {
    try {
      return await this.prisma.tag.upsert({
        where: { slug: tagData.slug },
        update: {
          name: tagData.name,
          color: tagData.color,
          updatedAt: new Date()
        },
        create: {
          slug: tagData.slug,
          name: tagData.name,
          color: tagData.color,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to upsert tag ${tagData.name}: ${error.message}`);
    }
  }

  // Transaction wrapper for data integrity
  async withTransaction(callback) {
    return await this.prisma.$transaction(callback, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  // Error handler wrapper
  async handleErrors(operation, errorMessage = 'Operation failed') {
    try {
      return await operation();
    } catch (error) {
      this.logError(`${errorMessage}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SeedingUtils;
