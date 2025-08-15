#!/usr/bin/env node

/*
  Seeds categories with real-world tech categories for a modern blog.
  Uses the new SeedingUtils for consistent error handling and logging.
  
  Usage:
    node scripts/dummy_data/seed-categories.js
*/

const SeedingUtils = require('./utils/seeding-utils');

// Real-world tech categories with improved descriptions and icons
const CATEGORIES = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Modern web development techniques, frameworks, and best practices. From HTML/CSS fundamentals to advanced JavaScript frameworks and performance optimization.',
    color: '#3B82F6',
    icon: '🌐'
  },
  {
    name: 'Frontend Development',
    slug: 'frontend-development',
    description: 'React, Vue, Angular, and modern frontend technologies. Component architecture, state management, and building responsive user interfaces.',
    color: '#8B5CF6',
    icon: '⚛️'
  },
  {
    name: 'Backend Development',
    slug: 'backend-development',
    description: 'Server-side development, APIs, and backend architecture. Node.js, Python, Go, and building scalable server applications.',
    color: '#10B981',
    icon: '🔧'
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, React Native, and mobile app development. Cross-platform solutions, native performance, and mobile UX best practices.',
    color: '#F59E0B',
    icon: '📱'
  },
  {
    name: 'DevOps & Cloud',
    slug: 'devops-cloud',
    description: 'CI/CD, Docker, Kubernetes, AWS, Azure, and cloud infrastructure. Automation, monitoring, and scalable deployment strategies.',
    color: '#EF4444',
    icon: '☁️'
  },
  {
    name: 'Data Science & AI',
    slug: 'data-science-ai',
    description: 'Machine learning, artificial intelligence, and data analytics. From basic statistics to deep learning and practical AI applications.',
    color: '#EC4899',
    icon: '🤖'
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security best practices, ethical hacking, and threat prevention. Application security, network security, and security testing.',
    color: '#DC2626',
    icon: '🔒'
  },
  {
    name: 'Database & Data',
    slug: 'database-data',
    description: 'SQL, NoSQL, data modeling, and database optimization. PostgreSQL, MongoDB, Redis, and data engineering best practices.',
    color: '#059669',
    icon: '🗄️'
  },
  {
    name: 'Programming Languages',
    slug: 'programming-languages',
    description: 'JavaScript, Python, Go, Rust, and language-specific tutorials. Language features, best practices, and performance optimization.',
    color: '#7C3AED',
    icon: '💻'
  },
  {
    name: 'Software Architecture',
    slug: 'software-architecture',
    description: 'System design, microservices, and architectural patterns. Scalable architecture, design principles, and system optimization.',
    color: '#1F2937',
    icon: '🏗️'
  },
  {
    name: 'Testing & Quality',
    slug: 'testing-quality',
    description: 'Unit testing, integration testing, and code quality practices. Test-driven development, automation, and quality assurance.',
    color: '#059669',
    icon: '🧪'
  },
  {
    name: 'Performance & Optimization',
    slug: 'performance-optimization',
    description: 'Speed optimization, caching strategies, and performance monitoring. Frontend and backend performance tuning techniques.',
    color: '#D97706',
    icon: '⚡'
  },
  {
    name: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'User interface design, user experience, and design systems. Design principles, accessibility, and creating intuitive interfaces.',
    color: '#BE185D',
    icon: '🎨'
  },
  {
    name: 'Open Source',
    slug: 'open-source',
    description: 'Contributing to open source, community projects, and collaboration. Building and maintaining open source software.',
    color: '#059669',
    icon: '📖'
  },
  {
    name: 'Career & Learning',
    slug: 'career-learning',
    description: 'Career advice, learning resources, and professional development. Skill development, industry insights, and career growth strategies.',
    color: '#7C2D12',
    icon: '📚'
  },
  {
    name: 'Blockchain & Web3',
    slug: 'blockchain-web3',
    description: 'Blockchain technology, cryptocurrencies, and decentralized applications. Smart contracts, DeFi, and the future of the web.',
    color: '#F7931E',
    icon: '⛓️'
  },
  {
    name: 'Game Development',
    slug: 'game-development',
    description: 'Game development with Unity, Unreal Engine, and web technologies. Game design principles, graphics programming, and interactive experiences.',
    color: '#8B5CF6',
    icon: '🎮'
  },
  {
    name: 'IoT & Hardware',
    slug: 'iot-hardware',
    description: 'Internet of Things, embedded systems, and hardware programming. Arduino, Raspberry Pi, and connected device development.',
    color: '#FF6B6B',
    icon: '🔌'
  }
];

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('🌱 Tech Categories Seeding Script');
    utils.log('Creating comprehensive tech categories for your blog...', 'white');

    // Connect to database
    utils.logSection('🔍 Database Connection');
    await utils.connect();

    // Seed categories
    utils.logSection('📝 Creating Categories');
    let created = 0;
    let updated = 0;

    for (const category of CATEGORIES) {
      try {
        // Validate required fields
        utils.validateRequiredFields(category, ['name', 'slug', 'description']);

        const existing = await utils.prisma.category.findUnique({
          where: { slug: category.slug }
        });

        if (existing) {
          await utils.upsertCategory(category);
          updated++;
          utils.logInfo(`Updated: ${category.icon} ${category.name}`);
        } else {
          await utils.upsertCategory(category);
          created++;
          utils.logSuccess(`Created: ${category.icon} ${category.name}`);
        }
      } catch (error) {
        utils.logError(`Error with category ${category.name}: ${error.message}`);
        throw error;
      }
    }

    // Display results
    utils.logSection('📊 Seeding Results');
    utils.log(`Total Categories: ${CATEGORIES.length}`, 'white');
    utils.log(`Newly Created: ${created}`, 'green');
    utils.log(`Updated: ${updated}`, 'blue');

    // Display all categories
    utils.logSection('📋 All Categories');
    const allCategories = await utils.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    allCategories.forEach((cat, index) => {
      utils.log(`${index + 1}. ${cat.icon || '📁'} ${cat.name} (${cat.slug})`, 'white');
      utils.log(`   ${cat.description}`, 'cyan');
      if (cat.color) {
        utils.log(`   Color: ${cat.color}`, 'magenta');
      }
    });

    utils.logSection('✅ Seeding Complete');
    utils.log('Categories are ready for use in your blog!', 'green');

  } catch (error) {
    utils.logError(`Seeding error: ${error.message}`);
    utils.logSection('🔧 Troubleshooting');
    utils.log('1. Ensure database is running', 'white');
    utils.log('2. Check DATABASE_URL in .env file', 'white');
    utils.log('3. Verify Prisma schema is up to date', 'white');
    utils.log('4. Run: npm run db:generate', 'white');
    utils.log('5. Run: npm run db:push', 'white');
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Script interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Script terminated');
  process.exit(0);
});

// Run the script
seed().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
