#!/usr/bin/env node

/*
  Seeds tags with real-world tech tags for a modern blog.
  
  Usage:
    node scripts/dummy_data/seed-tags.js
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

// Real-world tech tags organized by category
const TAGS = [
  // Frontend Technologies
  { name: 'React', slug: 'react', color: '#61DAFB' },
  { name: 'Vue.js', slug: 'vuejs', color: '#4FC08D' },
  { name: 'Angular', slug: 'angular', color: '#DD0031' },
  { name: 'Next.js', slug: 'nextjs', color: '#000000' },
  { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
  { name: 'CSS', slug: 'css', color: '#1572B6' },
  { name: 'Tailwind CSS', slug: 'tailwind-css', color: '#06B6D4' },
  { name: 'Sass', slug: 'sass', color: '#CC6699' },
  { name: 'Webpack', slug: 'webpack', color: '#8DD6F9' },
  { name: 'Vite', slug: 'vite', color: '#646CFF' },
  { name: 'Redux', slug: 'redux', color: '#764ABC' },
  { name: 'Zustand', slug: 'zustand', color: '#764ABC' },
  { name: 'GraphQL', slug: 'graphql', color: '#E10098' },
  { name: 'REST API', slug: 'rest-api', color: '#FF6B6B' },

  // Backend Technologies
  { name: 'Node.js', slug: 'nodejs', color: '#339933' },
  { name: 'Express.js', slug: 'expressjs', color: '#000000' },
  { name: 'Python', slug: 'python', color: '#3776AB' },
  { name: 'Django', slug: 'django', color: '#092E20' },
  { name: 'Flask', slug: 'flask', color: '#000000' },
  { name: 'Go', slug: 'go', color: '#00ADD8' },
  { name: 'Rust', slug: 'rust', color: '#000000' },
  { name: 'Java', slug: 'java', color: '#ED8B00' },
  { name: 'Spring Boot', slug: 'spring-boot', color: '#6DB33F' },
  { name: 'C#', slug: 'csharp', color: '#239120' },
  { name: '.NET', slug: 'dotnet', color: '#512BD4' },
  { name: 'PHP', slug: 'php', color: '#777BB4' },
  { name: 'Laravel', slug: 'laravel', color: '#FF2D20' },

  // Database & Data
  { name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  { name: 'MySQL', slug: 'mysql', color: '#4479A1' },
  { name: 'MongoDB', slug: 'mongodb', color: '#47A248' },
  { name: 'Redis', slug: 'redis', color: '#DC382D' },
  { name: 'Prisma', slug: 'prisma', color: '#2D3748' },
  { name: 'Sequelize', slug: 'sequelize', color: '#52B0E7' },
  { name: 'SQL', slug: 'sql', color: '#E48E00' },
  { name: 'Data Modeling', slug: 'data-modeling', color: '#10B981' },

  // DevOps & Cloud
  { name: 'Docker', slug: 'docker', color: '#2496ED' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '#326CE5' },
  { name: 'AWS', slug: 'aws', color: '#FF9900' },
  { name: 'Azure', slug: 'azure', color: '#0078D4' },
  { name: 'Google Cloud', slug: 'google-cloud', color: '#4285F4' },
  { name: 'CI/CD', slug: 'cicd', color: '#FF6B6B' },
  { name: 'GitHub Actions', slug: 'github-actions', color: '#2088FF' },
  { name: 'Jenkins', slug: 'jenkins', color: '#D24939' },
  { name: 'Terraform', slug: 'terraform', color: '#7B42BC' },
  { name: 'Ansible', slug: 'ansible', color: '#EE0000' },
  { name: 'Vercel', slug: 'vercel', color: '#000000' },
  { name: 'Netlify', slug: 'netlify', color: '#00AD9F' },

  // Mobile Development
  { name: 'React Native', slug: 'react-native', color: '#61DAFB' },
  { name: 'Flutter', slug: 'flutter', color: '#02569B' },
  { name: 'iOS', slug: 'ios', color: '#000000' },
  { name: 'Android', slug: 'android', color: '#3DDC84' },
  { name: 'Swift', slug: 'swift', color: '#FA7343' },
  { name: 'Kotlin', slug: 'kotlin', color: '#7F52FF' },

  // Data Science & AI
  { name: 'Machine Learning', slug: 'machine-learning', color: '#FF6B6B' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', color: '#FF6B6B' },
  { name: 'Data Analytics', slug: 'data-analytics', color: '#10B981' },
  { name: 'TensorFlow', slug: 'tensorflow', color: '#FF6F00' },
  { name: 'PyTorch', slug: 'pytorch', color: '#EE4C2C' },
  { name: 'Pandas', slug: 'pandas', color: '#130654' },
  { name: 'NumPy', slug: 'numpy', color: '#4DABCF' },

  // Testing & Quality
  { name: 'Jest', slug: 'jest', color: '#C21325' },
  { name: 'Testing', slug: 'testing', color: '#10B981' },
  { name: 'Unit Testing', slug: 'unit-testing', color: '#10B981' },
  { name: 'Integration Testing', slug: 'integration-testing', color: '#10B981' },
  { name: 'E2E Testing', slug: 'e2e-testing', color: '#10B981' },
  { name: 'Playwright', slug: 'playwright', color: '#2EAD33' },
  { name: 'Cypress', slug: 'cypress', color: '#17202C' },
  { name: 'Code Quality', slug: 'code-quality', color: '#10B981' },
  { name: 'ESLint', slug: 'eslint', color: '#4B32C3' },
  { name: 'Prettier', slug: 'prettier', color: '#F7B93E' },

  // Performance & Optimization
  { name: 'Performance', slug: 'performance', color: '#F59E0B' },
  { name: 'Caching', slug: 'caching', color: '#F59E0B' },
  { name: 'CDN', slug: 'cdn', color: '#F59E0B' },
  { name: 'Lighthouse', slug: 'lighthouse', color: '#F59E0B' },
  { name: 'Bundle Optimization', slug: 'bundle-optimization', color: '#F59E0B' },
  { name: 'Image Optimization', slug: 'image-optimization', color: '#F59E0B' },

  // Security
  { name: 'Security', slug: 'security', color: '#DC2626' },
  { name: 'Authentication', slug: 'authentication', color: '#DC2626' },
  { name: 'Authorization', slug: 'authorization', color: '#DC2626' },
  { name: 'OAuth', slug: 'oauth', color: '#DC2626' },
  { name: 'JWT', slug: 'jwt', color: '#DC2626' },
  { name: 'HTTPS', slug: 'https', color: '#DC2626' },
  { name: 'XSS', slug: 'xss', color: '#DC2626' },
  { name: 'CSRF', slug: 'csrf', color: '#DC2626' },

  // Architecture & Design
  { name: 'Microservices', slug: 'microservices', color: '#1F2937' },
  { name: 'API Design', slug: 'api-design', color: '#1F2937' },
  { name: 'System Design', slug: 'system-design', color: '#1F2937' },
  { name: 'Design Patterns', slug: 'design-patterns', color: '#1F2937' },
  { name: 'Clean Code', slug: 'clean-code', color: '#1F2937' },
  { name: 'SOLID', slug: 'solid', color: '#1F2937' },

  // Tools & Utilities
  { name: 'Git', slug: 'git', color: '#F05032' },
  { name: 'VS Code', slug: 'vscode', color: '#007ACC' },
  { name: 'Terminal', slug: 'terminal', color: '#4A5568' },
  { name: 'NPM', slug: 'npm', color: '#CB3837' },
  { name: 'Yarn', slug: 'yarn', color: '#2C8EBB' },
  { name: 'Pnpm', slug: 'pnpm', color: '#F69220' },
  { name: 'GitHub', slug: 'github', color: '#181717' },
  { name: 'GitLab', slug: 'gitlab', color: '#FCA326' },

  // Emerging Technologies
  { name: 'Web3', slug: 'web3', color: '#F7931E' },
  { name: 'Blockchain', slug: 'blockchain', color: '#F7931E' },
  { name: 'Cryptocurrency', slug: 'cryptocurrency', color: '#F7931E' },
  { name: 'IoT', slug: 'iot', color: '#FF6B6B' },
  { name: 'Edge Computing', slug: 'edge-computing', color: '#FF6B6B' },
  { name: 'Serverless', slug: 'serverless', color: '#FF6B6B' },
  { name: 'Jamstack', slug: 'jamstack', color: '#FF6B6B' }
];

async function upsertTag(tagData) {
  return prisma.tag.upsert({
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
}

async function seed() {
  console.clear();
  logHeader('🏷️  Tech Tags Seeding Script');
  log('Creating comprehensive tech tags for your blog...', 'white');

  try {
    // Check database connection
    logSection('🔍 Database Connection Test');
    await prisma.$connect();
    logSuccess('Database connection successful');

    logSection('📝 Creating Tags');
    let created = 0;
    let updated = 0;

    for (const tag of TAGS) {
      try {
        const existing = await prisma.tag.findUnique({
          where: { slug: tag.slug }
        });

        if (existing) {
          await upsertTag(tag);
          updated++;
          logInfo(`Updated: ${tag.name}`);
        } else {
          await upsertTag(tag);
          created++;
          logSuccess(`Created: ${tag.name}`);
        }
      } catch (error) {
        log(`Error with tag ${tag.name}: ${error.message}`, 'red');
      }
    }

    logSection('📊 Seeding Results');
    log(`Total Tags: ${TAGS.length}`, 'white');
    log(`Newly Created: ${created}`, 'green');
    log(`Updated: ${updated}`, 'blue');

    // Display all tags
    logSection('📋 All Tags');
    const allTags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });

    allTags.forEach((tag, index) => {
      log(`${index + 1}. ${tag.name} (${tag.slug})`, 'white');
      if (tag.color) {
        log(`   Color: ${tag.color}`, 'cyan');
      }
    });

    logSection('✅ Seeding Complete');
    log('Tags are ready for use in your blog!', 'green');

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
