#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const crypto = require('crypto');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

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

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Password strength checker
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommon: !['password', '123456', 'admin', 'qwerty', 'letmein'].includes(password.toLowerCase()),
    noSequential: !/(.)\1{2,}/.test(password),
    noKeyboard: !/(qwerty|asdf|zxcv|123|abc)/i.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const issues = [];

  if (!checks.length) issues.push('At least 12 characters');
  if (!checks.uppercase) issues.push('At least one uppercase letter');
  if (!checks.lowercase) issues.push('At least one lowercase letter');
  if (!checks.numbers) issues.push('At least one number');
  if (!checks.special) issues.push('At least one special character');
  if (!checks.noCommon) issues.push('Not a common password');
  if (!checks.noSequential) issues.push('No repeated characters');
  if (!checks.noKeyboard) issues.push('No keyboard patterns');

  return {
    score,
    strong: score >= 6,
    issues,
    checks
  };
}

// Generate secure password
function generateSecurePassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function createAdmin() {
  console.clear();
  logHeader('🔐 Admin User Creation Script v2.0');
  log('This script will create a new admin user with full privileges.', 'white');
  log('Updated for the latest project structure and authentication system!', 'cyan');

  try {
    // Check if database is accessible
    logSection('🔍 Database Connection Test');
    try {
      await prisma.$connect();
      logSuccess('Database connection successful');
    } catch (error) {
      logError('Failed to connect to database');
      log('Please ensure your database is running and DATABASE_URL is correct', 'yellow');
      throw new Error('Database connection failed');
    }

    logSection('👤 Admin User Details');
    
    // Get admin details
    const username = await question(`${colors.white}Enter admin username: ${colors.reset}`);
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    const email = await question(`${colors.white}Enter admin email: ${colors.reset}`);
    if (!email || !validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const fullName = await question(`${colors.white}Enter admin full name: ${colors.reset}`);
    if (!fullName || fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }

    // Password handling
    logSection('🔒 Password Security');
    log('Password Requirements:', 'white');
    log('- At least 12 characters', 'white');
    log('- Mix of uppercase and lowercase letters', 'white');
    log('- At least one number', 'white');
    log('- At least one special character', 'white');
    log('- No common passwords or patterns', 'white');

    let password;
    let passwordChoice = await question(`\n${colors.white}Choose password option:\n1. Enter custom password\n2. Generate secure password\nEnter choice (1 or 2): ${colors.reset}`);

    if (passwordChoice === '2') {
      password = generateSecurePassword();
      log(`\nGenerated password: ${password}`, 'green');
      logWarning('Please save this password securely!');
    } else {
      password = await question(`${colors.white}Enter admin password: ${colors.reset}`);
    }

    // Check password strength
    const strength = checkPasswordStrength(password);
    
    if (!strength.strong) {
      logError('Password is not strong enough:');
      strength.issues.forEach(issue => log(`- ${issue}`, 'red'));
      log('\nPlease choose a stronger password.', 'yellow');
      rl.close();
      return;
    }

    logSuccess('Password strength: EXCELLENT');
    log(`Score: ${strength.score}/8`, 'green');

    // Role selection
    logSection('👑 Admin Role Selection');
    log('Available Roles:', 'white');
    log('1. ADMIN - Full access to admin panel', 'white');
    log('2. SUPER_ADMIN - Full access + system settings', 'white');
    log('3. MODERATOR - Limited access (content management only)', 'white');

    const roleChoice = await question(`\n${colors.white}Select role (1, 2, or 3): ${colors.reset}`);
    let role;
    switch (roleChoice) {
      case '1':
        role = 'ADMIN';
        break;
      case '2':
        role = 'SUPER_ADMIN';
        break;
      case '3':
        role = 'MODERATOR';
        break;
      default:
        role = 'ADMIN';
    }

    // Additional admin settings
    logSection('⚙️ Additional Settings');
    
    const isActive = await question(`${colors.white}Set account as active? (y/N): ${colors.reset}`);
    const emailVerified = await question(`${colors.white}Mark email as verified? (y/N): ${colors.reset}`);
    
    const bio = await question(`${colors.white}Bio (optional): ${colors.reset}`);
    const website = await question(`${colors.white}Website (optional): ${colors.reset}`);
    const location = await question(`${colors.white}Location (optional): ${colors.reset}`);

    // Create admin user
    logSection('🚀 Creating Admin User');
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        role,
        type: 'admin', // This is the key field for admin authentication
        isActive: isActive.toLowerCase() === 'y',
        emailVerified: emailVerified.toLowerCase() === 'y' ? new Date() : null,
        bio: bio || null,
        website: website || null,
        location: location || null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    logHeader('🎉 Admin User Created Successfully!');
    
    logSection('📋 Admin Details');
    log(`Username: ${adminUser.username}`, 'white');
    log(`Email: ${adminUser.email}`, 'white');
    log(`Full Name: ${adminUser.fullName}`, 'white');
    log(`Role: ${adminUser.role}`, 'white');
    log(`Type: ${adminUser.type}`, 'white');
    log(`ID: ${adminUser.id}`, 'white');
    log(`Active: ${adminUser.isActive ? 'Yes' : 'No'}`, 'white');
    log(`Email Verified: ${adminUser.emailVerified ? 'Yes' : 'No'}`, 'white');
    
    if (passwordChoice === '2') {
      logSection('🔑 Generated Password');
      log(`Password: ${password}`, 'green');
      logWarning('Please save this password securely!');
    }

    logSection('🌐 Access Information');
    log('Admin can now login at:', 'white');
    log(`- Development: http://localhost:3000/admin/login`, 'cyan');
    log(`- Production: ${process.env.NEXTAUTH_URL || 'your-domain'}/admin/login`, 'cyan');
    
    logSection('🔐 Login Credentials');
    log(`Username: ${adminUser.username}`, 'white');
    log(`Email: ${adminUser.email}`, 'white');
    if (passwordChoice === '1') {
      log(`Password: [Your entered password]`, 'white');
    } else {
      log(`Password: ${password}`, 'green');
    }

    logSection('⚠️  Important Notes');
    log('• Keep your admin credentials secure', 'yellow');
    log('• Change password after first login', 'yellow');
    log('• Enable 2FA for additional security', 'yellow');
    log('• Regular password rotation recommended', 'yellow');

    logSection('🚀 Next Steps');
    log('1. Test admin login', 'white');
    log('2. Configure admin panel settings', 'white');
    log('3. Create initial categories and tags', 'white');
    log('4. Set up email templates', 'white');
    log('5. Configure user roles and permissions', 'white');

  } catch (error) {
    logError(`Error: ${error.message}`);
    logSection('🔧 Troubleshooting');
    log('1. Ensure database is running', 'white');
    log('2. Check DATABASE_URL in .env file', 'white');
    log('3. Verify Prisma schema is up to date', 'white');
    log('4. Run: npm run db:generate', 'white');
    log('5. Run: npm run db:push', 'white');
  } finally {
    rl.close();
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
createAdmin().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
