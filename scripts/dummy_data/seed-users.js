#!/usr/bin/env node

/*
  Seed realistic tech professionals into the database.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Uses Prisma and bcryptjs
  - Upserts by email to avoid duplicates
  - Password for all users: Password123!
*/

const SeedingUtils = require('./utils/seeding-utils');
const bcrypt = require('bcryptjs');

// Realistic tech professionals with diverse backgrounds
const USERS = [
  {
    fullName: 'Dr. Sarah Chen',
    username: 'sarah.chen',
    email: 'sarah.chen@techblog.com',
    location: 'San Francisco, CA, USA',
    website: 'https://sarahchen.dev',
    bio: 'Senior Software Engineer at Google, specializing in machine learning infrastructure. PhD in Computer Science from Stanford. Passionate about AI ethics and scalable systems.',
    role: 'USER'
  },
  {
    fullName: 'Marcus Rodriguez',
    username: 'marcus.rodriguez',
    email: 'marcus.rodriguez@techblog.com',
    location: 'Austin, TX, USA',
    website: 'https://marcusrodriguez.io',
    bio: 'Full-stack developer and DevOps engineer with 8+ years of experience. Expert in React, Node.js, and AWS. Building scalable web applications and mentoring junior developers.',
    role: 'USER'
  },
  {
    fullName: 'Priya Patel',
    username: 'priya.patel',
    email: 'priya.patel@techblog.com',
    location: 'London, UK',
    website: 'https://priyapatel.co.uk',
    bio: 'Frontend architect and design systems specialist. Leading UI/UX initiatives at a fintech startup. Advocate for accessibility and inclusive design in technology.',
    role: 'USER'
  },
  {
    fullName: 'Alex Kim',
    username: 'alex.kim',
    email: 'alex.kim@techblog.com',
    location: 'Seoul, South Korea',
    website: 'https://alexkim.dev',
    bio: 'Mobile app developer specializing in React Native and Flutter. Building cross-platform solutions for healthcare applications. Passionate about mobile performance optimization.',
    role: 'USER'
  },
  {
    fullName: 'Elena Popov',
    username: 'elena.popov',
    email: 'elena.popov@techblog.com',
    location: 'Berlin, Germany',
    website: 'https://elenapopov.de',
    bio: 'Backend engineer and database specialist. Expert in PostgreSQL, Redis, and microservices architecture. Contributing to open source projects and building resilient systems.',
    role: 'USER'
  },
  {
    fullName: 'David Thompson',
    username: 'david.thompson',
    email: 'david.thompson@techblog.com',
    location: 'Toronto, Canada',
    website: 'https://davidthompson.ca',
    bio: 'Security engineer and penetration tester. Specializing in application security, cloud security, and threat modeling. Helping organizations build secure-by-design systems.',
    role: 'USER'
  },
  {
    fullName: 'Aisha Hassan',
    username: 'aisha.hassan',
    email: 'aisha.hassan@techblog.com',
    location: 'Dubai, UAE',
    website: 'https://aishahassan.ae',
    bio: 'Data scientist and machine learning engineer. Building AI solutions for e-commerce and fintech. Expert in Python, TensorFlow, and big data processing.',
    role: 'USER'
  },
  {
    fullName: 'Carlos Mendez',
    username: 'carlos.mendez',
    email: 'carlos.mendez@techblog.com',
    location: 'Mexico City, Mexico',
    website: 'https://carlosmendez.mx',
    bio: 'DevOps engineer and cloud architect. Specializing in Kubernetes, Docker, and multi-cloud deployments. Building CI/CD pipelines and infrastructure as code.',
    role: 'USER'
  },
  {
    fullName: 'Yuki Tanaka',
    username: 'yuki.tanaka',
    email: 'yuki.tanaka@techblog.com',
    location: 'Tokyo, Japan',
    website: 'https://yukitanaka.jp',
    bio: 'Game developer and graphics programmer. Working with Unity and Unreal Engine. Creating immersive gaming experiences and optimizing rendering pipelines.',
    role: 'USER'
  },
  {
    fullName: 'Nadia Al-Zahra',
    username: 'nadia.alzahra',
    email: 'nadia.alzahra@techblog.com',
    location: 'Cairo, Egypt',
    website: 'https://nadiaalzahra.eg',
    bio: 'Blockchain developer and smart contract specialist. Building DeFi applications and exploring Web3 technologies. Passionate about decentralized finance and digital sovereignty.',
    role: 'USER'
  },
  {
    fullName: 'James Wilson',
    username: 'james.wilson',
    email: 'james.wilson@techblog.com',
    location: 'Sydney, Australia',
    website: 'https://jameswilson.au',
    bio: 'Software architect and technical lead. Designing scalable systems for enterprise applications. Expert in Java, Spring Boot, and microservices patterns.',
    role: 'USER'
  },
  {
    fullName: 'Sofia Ivanova',
    username: 'sofia.ivanova',
    email: 'sofia.ivanova@techblog.com',
    location: 'Moscow, Russia',
    website: 'https://sofiaivanova.ru',
    bio: 'QA engineer and test automation specialist. Building comprehensive testing frameworks and ensuring software quality. Expert in Selenium, Playwright, and CI/CD testing.',
    role: 'USER'
  },
  {
    fullName: 'Rajesh Kumar',
    username: 'rajesh.kumar',
    email: 'rajesh.kumar@techblog.com',
    location: 'Bangalore, India',
    website: 'https://rajeshkumar.in',
    bio: 'Full-stack developer and technical writer. Building web applications with modern JavaScript frameworks. Sharing knowledge through blog posts and open source contributions.',
    role: 'USER'
  },
  {
    fullName: 'Isabella Santos',
    username: 'isabella.santos',
    email: 'isabella.santos@techblog.com',
    location: 'São Paulo, Brazil',
    website: 'https://isabellasantos.br',
    bio: 'UX researcher and product designer. Conducting user research and designing intuitive interfaces. Bridging the gap between user needs and technical implementation.',
    role: 'USER'
  },
  {
    fullName: 'Ahmed Hassan',
    username: 'ahmed.hassan',
    email: 'ahmed.hassan@techblog.com',
    location: 'Cairo, Egypt',
    website: 'https://ahmedhassan.eg',
    bio: 'Backend developer and API specialist. Building RESTful and GraphQL APIs for enterprise applications. Expert in Node.js, Python, and database optimization.',
    role: 'USER'
  }
];

function generateAvatar(username) {
  // Generate unique placeholder avatar per user
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

async function seed() {
  const utils = new SeedingUtils();
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const password = 'Password123!';
  
  try {
    utils.logHeader('👥 Tech Professionals Seeding Script');
    utils.log('Creating realistic tech professionals for your blog...', 'white');

    // Connect to database
    utils.logSection('🔍 Database Connection');
    await utils.connect();

    // Hash password once
    utils.logSection('🔐 Password Setup');
    const hash = await bcrypt.hash(password, rounds);
    utils.logSuccess(`Password hashed with ${rounds} rounds`);

    // Seed users
    utils.logSection('📝 Creating Users');
    let created = 0;
    let updated = 0;

    for (const user of USERS) {
      try {
        // Validate required fields
        utils.validateRequiredFields(user, ['fullName', 'username', 'email']);

        const result = await utils.prisma.user.upsert({
          where: { email: user.email },
          create: {
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            password: hash,
            bio: user.bio,
            website: user.website,
            location: user.location,
            avatar: generateAvatar(user.username),
            role: user.role,
            isActive: true,
            emailVerified: new Date()
          },
          update: {
            username: user.username,
            fullName: user.fullName,
            bio: user.bio,
            website: user.website,
            location: user.location,
            avatar: generateAvatar(user.username),
            isActive: true
          },
          select: { id: true, email: true, username: true, fullName: true }
        });

        if (result.id) {
          created++;
          utils.logSuccess(`Created: ${result.fullName} (${result.email})`);
        } else {
          updated++;
          utils.logInfo(`Updated: ${result.fullName} (${result.email})`);
        }
      } catch (error) {
        utils.logError(`Error with user ${user.fullName}: ${error.message}`);
        throw error;
      }
    }

    // Display results
    utils.logSection('📊 Seeding Results');
    utils.log(`Total Users: ${USERS.length}`, 'white');
    utils.log(`Newly Created: ${created}`, 'green');
    utils.log(`Updated: ${updated}`, 'blue');

    // Display all users
    utils.logSection('📋 All Users');
    const allUsers = await utils.prisma.user.findMany({
      orderBy: { fullName: 'asc' },
      select: { username: true, email: true, fullName: true, location: true, role: true }
    });

    allUsers.forEach((user, index) => {
      utils.log(`${index + 1}. ${user.fullName} (@${user.username})`, 'white');
      utils.log(`   ${user.email} | ${user.location || 'No location'} | ${user.role}`, 'cyan');
    });

    utils.logSection('✅ Seeding Complete');
    utils.log('Users are ready for use in your blog!', 'green');
    utils.log(`Default password for all users: ${password}`, 'yellow');

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


