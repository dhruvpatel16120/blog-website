#!/usr/bin/env node

/*
  Seeds users with realistic data and roles:
  - 15 users with role USER
  - 2 users with role MODERATOR
  - 2 users with role ADMIN
  - 1 SUPER_ADMIN user

  Usage:
    node scripts/dummy_data/seed-users.js
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

const FIRST_NAMES = [
  'Ava','Liam','Noah','Emma','Olivia','Elijah','Sophia','Isabella','Lucas','Mia',
  'Ethan','Amelia','James','Charlotte','Benjamin','Harper','Henry','Evelyn','Alexander','Abigail',
];

const LAST_NAMES = [
  'Patel','Shah','Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function usernameFrom(name) {
  const base = name.toLowerCase().replace(/[^a-z]/g, '');
  const suffix = Math.floor(Math.random() * 900 + 100); // 100-999
  return `${base}${suffix}`;
}

function emailFrom(name) {
  const providers = ['gmail.com','outlook.com','yahoo.com','protonmail.com','icloud.com'];
  const handle = name.toLowerCase().replace(/[^a-z]/g, '');
  return `${handle}@${pick(providers)}`;
}

function websiteFrom(name) {
  const handle = name.toLowerCase().replace(/[^a-z]/g, '');
  const domains = ['dev','tech','io','com','net'];
  return `https://www.${handle}.${pick(domains)}`;
}

function bioFrom(name, role) {
  const bios = {
    'USER': `${name} is a passionate developer who enjoys building modern web apps and writing about technology.`,
    'MODERATOR': `${name} is an experienced developer and community moderator, helping others learn and grow.`,
    'ADMIN': `${name} is a senior developer and administrator, managing content and community standards.`,
    'SUPER_ADMIN': `${name} is a system administrator with full access to manage the platform and users.`
  };
  return bios[role] || bios['USER'];
}

function locationFrom() {
  const locations = [
    'San Francisco, CA', 'New York, NY', 'London, UK', 'Toronto, Canada',
    'Berlin, Germany', 'Tokyo, Japan', 'Sydney, Australia', 'Remote',
    'Austin, TX', 'Seattle, WA', 'Amsterdam, Netherlands', 'Paris, France'
  ];
  return pick(locations);
}

async function createUsers(count, role = 'USER') {
  const results = [];
  const passwordHash = await bcrypt.hash('user@12345', 12);
  
  for (let i = 0; i < count; i += 1) {
    const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const username = usernameFrom(fullName);
    const email = emailFrom(username);
    const website = websiteFrom(username);
    const bio = bioFrom(fullName, role);
    const location = locationFrom();
    
    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          fullName,
          password: passwordHash,
          role,
          type: role === 'USER' ? 'user' : 'admin', // Set type based on role
          isActive: true,
          website,
          bio,
          location,
          emailVerified: role === 'SUPER_ADMIN' ? new Date() : null, // Super admin email verified
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      });
      results.push(user);
    } catch (error) {
      log(`Error creating user ${username}: ${error.message}`, 'red');
    }
  }
  return results;
}

async function ensureSuperAdmin() {
  const existing = await prisma.user.findFirst({ 
    where: { 
      role: 'SUPER_ADMIN',
      type: 'admin'
    } 
  });
  
  if (existing) return existing;
  
  const password = await bcrypt.hash('super@12345', 12);
  return prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@techblog.com',
      fullName: 'Super Administrator',
      password,
      role: 'SUPER_ADMIN',
      type: 'admin',
      isActive: true,
      emailVerified: new Date(),
      bio: 'System administrator with full access to manage the platform and users.',
      website: 'https://www.techblog.com',
      location: 'System',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });
}

async function seed() {
  console.clear();
  logHeader('👥 Tech Blog Users Seeding Script');
  log('Creating realistic users with different roles for your tech blog...', 'white');

  try {
    // Check database connection
    logSection('🔍 Database Connection Test');
    await prisma.$connect();
    logSuccess('Database connection successful');

    logSection('👤 Creating Users');
    
    // Users
    const users = await createUsers(15, 'USER');
    logSuccess(`Created ${users.length} users (USER)`);

    const moderators = await createUsers(2, 'MODERATOR');
    logSuccess(`Created ${moderators.length} users (MODERATOR)`);

    const admins = await createUsers(2, 'ADMIN');
    logSuccess(`Created ${admins.length} users (ADMIN)`);

    // Super admin
    const superAdmin = await ensureSuperAdmin();
    logSuccess(`Ensured SUPER_ADMIN: ${superAdmin.username}`);

    logSection('📊 Seeding Results');
    log(`Total Users Created: ${users.length + moderators.length + admins.length + 1}`, 'white');
    log(`Regular Users: ${users.length}`, 'green');
    log(`Moderators: ${moderators.length}`, 'blue');
    log(`Admins: ${admins.length}`, 'yellow');
    log(`Super Admin: 1`, 'magenta');

    // Display sample users
    logSection('📋 Sample Users Created');
    log('Regular Users:', 'white');
    users.slice(0, 3).forEach((user, index) => {
      log(`${index + 1}. ${user.fullName} (@${user.username}) - ${user.email}`, 'cyan');
    });
    
    if (moderators.length > 0) {
      log('\nModerators:', 'white');
      moderators.forEach((user, index) => {
        log(`${index + 1}. ${user.fullName} (@${user.username}) - ${user.email}`, 'blue');
      });
    }
    
    if (admins.length > 0) {
      log('\nAdmins:', 'white');
      admins.forEach((user, index) => {
        log(`${index + 1}. ${user.fullName} (@${user.username}) - ${user.email}`, 'yellow');
      });
    }

    log('\nSuper Admin:', 'white');
    log(`1. ${superAdmin.fullName} (@${superAdmin.username}) - ${superAdmin.email}`, 'magenta');

    logSection('🔐 Default Passwords');
    log('All users created with password: user@12345', 'yellow');
    log('Super admin password: super@12345', 'yellow');
    log('⚠️  Remember to change these passwords in production!', 'red');

    logSection('✅ Seeding Complete');
    log('Users are ready for your tech blog!', 'green');
    log('You can now run seed-posts.js to create blog posts with these users.', 'cyan');

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
  log('No changes were made to your database.', 'white');
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


