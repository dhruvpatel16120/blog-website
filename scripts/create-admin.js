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

async function createAdmin() {
  console.log('🔐 Admin User Creation Script\n');
  console.log('This script will create a new admin user with full privileges.\n');

  try {
    // Get admin details
    const username = await question('Enter admin username: ');
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    // Check if username already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      throw new Error('Username already exists');
    }

    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    // Check if email already exists
    const existingEmail = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const fullName = await question('Enter admin full name: ');
    if (!fullName || fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }

    // Password handling
    console.log('\n🔒 Password Requirements:');
    console.log('- At least 12 characters');
    console.log('- Mix of uppercase and lowercase letters');
    console.log('- At least one number');
    console.log('- At least one special character');
    console.log('- No common passwords or patterns\n');

    let password;
    let passwordChoice = await question('Choose password option:\n1. Enter custom password\n2. Generate secure password\nEnter choice (1 or 2): ');

    if (passwordChoice === '2') {
      password = generateSecurePassword();
      console.log(`\nGenerated password: ${password}`);
      console.log('⚠️  Please save this password securely!\n');
    } else {
      password = await question('Enter admin password: ');
    }

    // Check password strength
    const strength = checkPasswordStrength(password);
    
    if (!strength.strong) {
      console.log('\n❌ Password is not strong enough:');
      strength.issues.forEach(issue => console.log(`- ${issue}`));
      console.log('\nPlease choose a stronger password.');
      rl.close();
      return;
    }

    console.log('\n✅ Password strength: EXCELLENT');
    console.log(`Score: ${strength.score}/8`);

    // Role selection
    console.log('\n👑 Admin Roles:');
    console.log('1. ADMIN - Full access to admin panel');
    console.log('2. SUPER_ADMIN - Full access + system settings');
    console.log('3. MODERATOR - Limited access (content management only)');

    const roleChoice = await question('Select role (1, 2, or 3): ');
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

    // Permissions based on role
    let permissions;
    switch (role) {
      case 'SUPER_ADMIN':
        permissions = JSON.stringify([
          'posts:read', 'posts:write', 'posts:delete',
          'users:read', 'users:write', 'users:delete',
          'admins:read', 'admins:write', 'admins:delete',
          'categories:read', 'categories:write', 'categories:delete',
          'tags:read', 'tags:write', 'tags:delete',
          'comments:read', 'comments:write', 'comments:delete',
          'contacts:read', 'contacts:write', 'contacts:delete',
          'settings:read', 'settings:write',
          'analytics:read', 'analytics:write',
          'system:admin'
        ]);
        break;
      case 'ADMIN':
        permissions = JSON.stringify([
          'posts:read', 'posts:write', 'posts:delete',
          'users:read', 'users:write',
          'categories:read', 'categories:write', 'categories:delete',
          'tags:read', 'tags:write', 'tags:delete',
          'comments:read', 'comments:write', 'comments:delete',
          'contacts:read', 'contacts:write',
          'analytics:read'
        ]);
        break;
      case 'MODERATOR':
        permissions = JSON.stringify([
          'posts:read', 'posts:write',
          'comments:read', 'comments:write', 'comments:delete',
          'contacts:read', 'contacts:write'
        ]);
        break;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        role,
        permissions,
        isActive: true
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`\n📋 Admin Details:`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Full Name: ${admin.fullName}`);
    console.log(`Role: ${admin.role}`);
    console.log(`ID: ${admin.id}`);
    
    if (passwordChoice === '2') {
      console.log(`\n🔑 Generated Password: ${password}`);
      console.log('⚠️  Please save this password securely!');
    }

    console.log('\n🚀 Admin can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin().catch(console.error);
