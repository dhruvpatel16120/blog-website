#!/usr/bin/env node

/*
  Interactive Admin Creator for Tech Blog
  - Loads env (.env if available)
  - Validates inputs
  - Creates or updates an Admin with hashed password
  - Supports custom JSON permissions
*/

const readline = require('readline');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Try to load .env if dotenv is available
try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
  // eslint-disable-next-line no-empty
} catch (e) {}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

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

function logOk(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function logWarn(msg) { console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`); }
function logErr(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }
function logHdr(msg) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function isStrongPassword(pw) {
  const s = String(pw || '');
  return s.length >= 8 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s);
}

function generatePassword() {
  // 16 chars with letters, numbers and symbols
  const buf = crypto.randomBytes(16).toString('base64');
  // Ensure no slash/plus for convenience
  return buf.replace(/[+/=]/g, '').slice(0, 16) + '1aA!';
}

async function confirm(q) {
  const a = (await ask(`${colors.yellow}${q} (y/N): ${colors.reset}`)).trim().toLowerCase();
  return a === 'y' || a === 'yes';
}

async function main() {
  console.clear();
  logHdr('🔐 Create or Update Admin');

  const db = process.env.DATABASE_URL || '';
  if (!db) {
    logWarn('DATABASE_URL is not set. Prisma may fail to connect.');
  } else {
    const redacted = db.replace(/:(.*?)@/, ':***@');
    console.log(`${colors.cyan}Database:${colors.reset} ${redacted}`);
  }

  // Basic connectivity check
  try {
    await prisma.$queryRaw`SELECT 1`;
    logOk('Database connection OK');
  } catch (e) {
    logErr(`Database connection failed: ${e?.message || e}`);
    process.exit(1);
  }

  // Gather input
  let email = (await ask(`${colors.white}Admin email: ${colors.reset}`)).trim();
  while (!isEmail(email)) {
    logErr('Please enter a valid email.');
    email = (await ask(`${colors.white}Admin email: ${colors.reset}`)).trim();
  }

  let username = (await ask(`${colors.white}Username (min 3 chars): ${colors.reset}`)).trim();
  while (!username || username.length < 3) {
    logErr('Username must be at least 3 characters.');
    username = (await ask(`${colors.white}Username (min 3 chars): ${colors.reset}`)).trim();
  }

  const fullName = (await ask(`${colors.white}Full name: ${colors.reset}`)).trim() || 'Administrator';

  let password = (await ask(`${colors.white}Password (leave blank to auto-generate): ${colors.reset}`)).trim();
  if (!password) {
    if (await confirm('Generate a strong password automatically?')) {
      password = generatePassword();
      logOk(`Generated password: ${colors.bright}${password}${colors.reset}`);
    } else {
      while (!isStrongPassword(password)) {
        logWarn('Password should be at least 8 chars and include upper, lower and number.');
        password = (await ask(`${colors.white}Password: ${colors.reset}`)).trim();
      }
    }
  } else if (!isStrongPassword(password)) {
    logWarn('Password is weak. Consider regenerating.');
  }

  // Role selection (schema only has ADMIN for now)
  console.log(`\n${colors.cyan}Role:${colors.reset} ADMIN`);
  const role = 'ADMIN';

  // Permissions
  console.log(`\n${colors.cyan}Permissions:${colors.reset}`);
  console.log('1. Full access');
  console.log('2. Custom (comma-separated)');
  let permChoice = (await ask(`${colors.white}Choose [1-2]: ${colors.reset}`)).trim();
  if (permChoice !== '1' && permChoice !== '2') permChoice = '1';
  let permissions;
  if (permChoice === '1') {
    permissions = { capabilities: ['*'] };
  } else {
    const raw = (await ask(`${colors.white}Enter capabilities (e.g., posts:read,posts:write,users:manage): ${colors.reset}`)).trim();
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    permissions = { capabilities: list.length ? list : ['*'] };
  }

  // Active?
  const isActive = await confirm('Mark admin as active?');

  // Check existing admin by email
  const existing = await prisma.admin.findUnique({ where: { email } });

  const hashed = await bcrypt.hash(password, 12);

  if (existing) {
    logWarn(`An admin with email ${email} already exists.`);
    if (!(await confirm('Update this admin?'))) {
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    const updated = await prisma.admin.update({
      where: { email },
      data: {
        username,
        fullName,
        password: hashed,
        role,
        isActive,
        permissions: JSON.stringify(permissions)
      },
      select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true }
    });

    logOk('Admin updated successfully');
    console.log(updated);
  } else {
    const created = await prisma.admin.create({
      data: {
        email,
        username,
        fullName,
        password: hashed,
        role,
        isActive,
        permissions: JSON.stringify(permissions)
      },
      select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true }
    });

    logOk('Admin created successfully');
    console.log(created);
  }

  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log('- Use the credentials above to sign in at /admin/login');
  console.log('- Store the password securely and rotate it periodically');

  rl.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  logErr(e?.message || String(e));
  try { await prisma.$disconnect(); } catch {}
  rl.close();
  process.exit(1);
});


