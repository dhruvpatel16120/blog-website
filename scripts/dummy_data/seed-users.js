#!/usr/bin/env node

/*
  Seeds users with realistic data and roles:
  - 15 users with role USER
  - 2 users with role MODERATOR
  - 2 users with role ADMIN
  - 1 SUPER_ADMIN admin in admins table

  Usage:
    node scripts/dummy_data/seed-users.js
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
  const providers = ['example.com','mail.com','web.dev','inbox.dev'];
  const handle = name.toLowerCase().replace(/[^a-z]/g, '');
  return `${handle}@${pick(providers)}`;
}

function websiteFrom(name) {
  const handle = name.toLowerCase().replace(/[^a-z]/g, '');
  return `https://www.${handle}.dev`;
}

function bioFrom(name) {
  return `${name} is a passionate developer who enjoys building modern web apps and writing about technology.`;
}

async function createUsers(count, role = 'USER') {
  const results = [];
  const passwordHash = await bcrypt.hash('user@12345', 12);
  for (let i = 0; i < count; i += 1) {
    const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const username = usernameFrom(fullName);
    const email = emailFrom(username);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: passwordHash,
        role,
        isActive: true,
        website: websiteFrom(username),
        bio: bioFrom(fullName),
        location: 'Remote',
        emailVerified: null,
      },
    });
    results.push(user);
  }
  return results;
}

async function ensureSuperAdmin() {
  const existing = await prisma.admin.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existing) return existing;
  const password = await bcrypt.hash('super@12345', 12);
  return prisma.admin.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      fullName: 'Super Admin',
      password,
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify([
        'posts:read','posts:write','posts:delete',
        'users:read','users:write','users:delete',
        'admins:read','admins:write','admins:delete',
        'categories:read','categories:write','categories:delete',
        'tags:read','tags:write','tags:delete',
        'comments:read','comments:write','comments:delete',
        'contacts:read','contacts:write','contacts:delete',
        'settings:read','settings:write','analytics:read','analytics:write','system:admin'
      ]),
      isActive: true,
    },
  });
}

async function seed() {
  console.log('👥 Seeding users with roles...');
  try {
    await prisma.$connect();

    // Users
    const users = await createUsers(15, 'USER');
    console.log(`✓ Created ${users.length} users (USER)`);

    const moderators = await createUsers(2, 'MODERATOR');
    console.log(`✓ Created ${moderators.length} users (MODERATOR)`);

    const admins = await createUsers(2, 'ADMIN');
    console.log(`✓ Created ${admins.length} users (ADMIN)`);

    // Super admin in admins table
    const superAdmin = await ensureSuperAdmin();
    console.log(`✓ Ensured SUPER_ADMIN admin: ${superAdmin.username}`);

    console.log('\n✅ All users seeded successfully.');
  } catch (e) {
    console.error('❌ Seed error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});


