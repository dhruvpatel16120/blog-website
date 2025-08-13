#!/usr/bin/env node

/*
  Seeds categories with real-world tech categories for a modern blog.
  
  Usage:
    node scripts/dummy_data/seed-categories.js
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.yellow}${colors.bright}${message}${colors.reset}`);
  console.log(`${colors.yellow}${'-'.repeat(message.length)}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Real-world tech categories
const CATEGORIES = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Modern web development techniques, frameworks, and best practices',
    color: '#3B82F6'
  },
  {
    name: 'Frontend Development',
    slug: 'frontend-development',
    description: 'React, Vue, Angular, and modern frontend technologies',
    color: '#8B5CF6'
  },
  {
    name: 'Backend Development',
    slug: 'backend-development',
    description: 'Server-side development, APIs, and backend architecture',
    color: '#10B981'
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, React Native, and mobile app development',
    color: '#F59E0B'
  },
  {
    name: 'DevOps & Cloud',
    slug: 'devops-cloud',
    description: 'CI/CD, Docker, Kubernetes, AWS, Azure, and cloud infrastructure',
    color: '#EF4444'
  },
  {
    name: 'Data Science & AI',
    slug: 'data-science-ai',
    description: 'Machine learning, artificial intelligence, and data analytics',
    color: '#EC4899'
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security best practices, ethical hacking, and threat prevention',
    color: '#DC2626'
  },
  {
    name: 'Database & Data',
    slug: 'database-data',
    description: 'SQL, NoSQL, data modeling, and database optimization',
    color: '#059669'
  },
  {
    name: 'Programming Languages',
    slug: 'programming-languages',
    description: 'JavaScript, Python, Go, Rust, and language-specific tutorials',
    color: '#7C3AED'
  },
  {
    name: 'Software Architecture',
    slug: 'software-architecture',
    description: 'System design, microservices, and architectural patterns',
    color: '#1F2937'
  },
  {
    name: 'Testing & Quality',
    slug: 'testing-quality',
    description: 'Unit testing, integration testing, and code quality practices',
    color: '#059669'
  },
  {
    name: 'Performance & Optimization',
    slug: 'performance-optimization',
    description: 'Speed optimization, caching strategies, and performance monitoring',
    color: '#D97706'
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'User interface design, user experience, and design systems',
    color: '#BE185D'
  },
  {
    name: 'Open Source',
    slug: 'open-source',
    description: 'Contributing to open source, community projects, and collaboration',
    color: '#059669'
  },
  {
    name: 'Career & Learning',
    slug: 'career-learning',
    description: 'Career advice, learning resources, and professional development',
    color: '#7C2D12'
  }
];

async function upsertCategory(categoryData) {
  return prisma.category.upsert({
    where: { slug: categoryData.slug },
    update: {
      name: categoryData.name,
      description: categoryData.description,
      color: categoryData.color,
      updatedAt: new Date()
    },
    create: {
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description,
      color: categoryData.color,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

async function seed() {
  console.clear();
  logHeader('🌱 Tech Categories Seeding Script');
  log('Creating comprehensive tech categories for your blog...', 'white');

  try {
    // Check database connection
    logSection('🔍 Database Connection Test');
    await prisma.$connect();
    logSuccess('Database connection successful');

    logSection('📝 Creating Categories');
    let created = 0;
    let updated = 0;

    for (const category of CATEGORIES) {
      try {
        const existing = await prisma.category.findUnique({
          where: { slug: category.slug }
        });

        if (existing) {
          await upsertCategory(category);
          updated++;
          logInfo(`Updated: ${category.name}`);
        } else {
          await upsertCategory(category);
          created++;
          logSuccess(`Created: ${category.name}`);
        }
      } catch (error) {
        log(`Error with category ${category.name}: ${error.message}`, 'red');
      }
    }

    logSection('📊 Seeding Results');
    log(`Total Categories: ${CATEGORIES.length}`, 'white');
    log(`Newly Created: ${created}`, 'green');
    log(`Updated: ${updated}`, 'blue');

    // Display all categories
    logSection('📋 All Categories');
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    allCategories.forEach((cat, index) => {
      log(`${index + 1}. ${cat.name} (${cat.slug})`, 'white');
      log(`   ${cat.description}`, 'cyan');
    });

    logSection('✅ Seeding Complete');
    log('Categories are ready for use in your blog!', 'green');

  } catch (error) {
    log(`❌ Seeding error: ${error.message}`, 'red');
    logSection('🔧 Troubleshooting');
    log('1. Ensure database is running', 'white');
    log('2. Check DATABASE_URL in .env file', 'white');
    log('3. Verify Prisma schema is up to date', 'white');
    log('4. Run: npm run db:generate', 'white');
    log('5. Run: npm run db:push', 'white');
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Script interrupted by user', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Script terminated', 'yellow');
  process.exit(0);
});

// Run the script
seed().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
