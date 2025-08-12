#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupDatabase() {
  console.log('🚀 Advanced Database Setup for PostgreSQL\n');
  console.log('This script will set up your database with initial data.\n');

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Check if database is empty
    const userCount = await prisma.user.count();
    const adminCount = await prisma.admin.count();
    const postCount = await prisma.post.count();

    if (userCount > 0 || adminCount > 0 || postCount > 0) {
      console.log('⚠️  Database already contains data.');
      const proceed = await question('Do you want to continue with setup? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        return;
      }
    }

    // Create default categories
    console.log('\n📂 Creating default categories...');
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Latest tech news and insights', color: '#3B82F6' },
      { name: 'Programming', slug: 'programming', description: 'Coding tutorials and tips', color: '#10B981' },
      { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend development', color: '#F59E0B' },
      { name: 'Design', slug: 'design', description: 'UI/UX and design principles', color: '#8B5CF6' },
      { name: 'Career', slug: 'career', description: 'Professional development and career advice', color: '#EF4444' }
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    }
    console.log('✅ Categories created successfully!');

    // Create default tags
    console.log('\n🏷️  Creating default tags...');
    const tags = [
      { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
      { name: 'React', slug: 'react', color: '#61DAFB' },
      { name: 'Next.js', slug: 'nextjs', color: '#000000' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'Python', slug: 'python', color: '#3776AB' },
      { name: 'CSS', slug: 'css', color: '#1572B6' },
      { name: 'HTML', slug: 'html', color: '#E34F26' },
      { name: 'Database', slug: 'database', color: '#336791' },
      { name: 'API', slug: 'api', color: '#FF6B6B' }
    ];

    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag
      });
    }
    console.log('✅ Tags created successfully!');

    // Create system settings
    console.log('\n⚙️  Creating system settings...');
    const settings = [
      { key: 'site_name', value: 'Tech Blog', description: 'Website name' },
      { key: 'site_description', value: 'A modern tech blog built with Next.js', description: 'Website description' },
      { key: 'posts_per_page', value: '10', description: 'Number of posts per page' },
      { key: 'enable_comments', value: 'true', description: 'Enable comment system' },
      { key: 'enable_registration', value: 'true', description: 'Enable user registration' },
      { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode' },
      { key: 'analytics_enabled', value: 'false', description: 'Enable analytics' },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications' }
    ];

    for (const setting of settings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      });
    }
    console.log('✅ System settings created successfully!');

    // Create sample user first
    console.log('\n👤 Creating sample user...');
    const hashedPassword = await bcrypt.hash('root@123', 12);
    const sampleUser = await prisma.user.upsert({
      where: { email: 'demo@techblog.com' },
      update: {},
      create: {
        username: 'demo',
        email: 'root@root.com',
        fullName: 'Demo User',
        password: hashedPassword,
        role: 'USER',
        bio: 'A passionate developer sharing knowledge about web development.',
        website: 'https://demo.com',
        location: 'San Francisco, CA',
        isActive: true
      }
    });
    console.log('✅ Sample user created successfully!');

    // Create sample posts
    console.log('\n📝 Creating sample posts...');
    const samplePosts = [
      {
        title: 'Getting Started with Next.js 15',
        slug: 'getting-started-nextjs-15',
        excerpt: 'Learn how to build modern web applications with Next.js 15 and its new features.',
        content: `# Getting Started with Next.js 15

Next.js 15 brings exciting new features and improvements to the React framework. In this post, we'll explore the key changes and how to get started.

## Key Features

- **App Router**: Improved routing with better performance
- **Server Components**: Enhanced server-side rendering
- **Turbopack**: Faster development builds
- **Improved TypeScript Support**: Better type safety

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

This will create a new Next.js project with all the latest features enabled.

## What's New

The new version includes several improvements:

1. **Performance**: Up to 50% faster builds
2. **Developer Experience**: Better error messages and debugging
3. **TypeScript**: Enhanced type checking and IntelliSense
4. **Accessibility**: Improved ARIA support and keyboard navigation

Stay tuned for more tutorials on Next.js 15!`,
        published: true,
        featured: true,
        viewCount: 1250,
        readTime: 8,
        seoTitle: 'Getting Started with Next.js 15 - Complete Guide',
        seoDescription: 'Learn how to build modern web applications with Next.js 15. Complete guide with examples and best practices.',
        categories: ['technology', 'programming'],
        tags: ['nextjs', 'react', 'javascript', 'typescript']
      },
      {
        title: 'Mastering Tailwind CSS',
        slug: 'mastering-tailwind-css',
        excerpt: 'A comprehensive guide to using Tailwind CSS for building beautiful, responsive websites.',
        content: `# Mastering Tailwind CSS

Tailwind CSS is a utility-first CSS framework that makes building custom designs easy and efficient.

## Why Tailwind CSS?

- **Utility-First**: Write styles directly in your HTML
- **Responsive**: Built-in responsive design utilities
- **Customizable**: Easy to customize and extend
- **Performance**: Only includes the CSS you use

## Basic Usage

\`\`\`html
<div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Hello Tailwind!
</div>
\`\`\`

## Responsive Design

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3 p-4">
  Responsive card
</div>
\`\`\`

## Custom Configuration

Create a \`tailwind.config.js\` file to customize your design system:

\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
      },
    },
  },
}
\`\`\`

Tailwind CSS is perfect for rapid prototyping and building production-ready applications.`,
        published: true,
        featured: false,
        viewCount: 890,
        readTime: 12,
        seoTitle: 'Mastering Tailwind CSS - Complete Guide',
        seoDescription: 'Learn Tailwind CSS from basics to advanced techniques. Build beautiful, responsive websites efficiently.',
        categories: ['web-development', 'design'],
        tags: ['css', 'tailwind', 'design', 'frontend']
      }
    ];

    for (const postData of samplePosts) {
      const { categories, tags, ...post } = postData;
      
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          authorId: sampleUser.id, // Use the real user ID
          publishedAt: new Date(),
        }
      });

      // Add categories
      for (const categorySlug of categories) {
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug }
        });
        if (category) {
          await prisma.postCategory.create({
            data: {
              postId: createdPost.id,
              categoryId: category.id
            }
          });
        }
      }

      // Add tags
      for (const tagSlug of tags) {
        const tag = await prisma.tag.findUnique({
          where: { slug: tagSlug }
        });
        if (tag) {
          await prisma.postTag.create({
            data: {
              postId: createdPost.id,
              tagId: tag.id
            }
          });
        }
      }
    }
    console.log('✅ Sample posts created successfully!');



    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Tags: ${tags.length}`);
    console.log(`- System Settings: ${settings.length}`);
    console.log(`- Sample Posts: ${samplePosts.length}`);
    console.log(`- Sample User: ${sampleUser.username} (role: ${sampleUser.role})`);
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Run: npm run create-admin');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure PostgreSQL is running');
    console.log('3. Run: npm run db:push');
    console.log('4. Run: npm run db:generate');
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the setup
setupDatabase().catch(console.error);
