#!/usr/bin/env node

/*
  Seed 15 real-world style users into the database.
  - Uses Prisma and bcryptjs
  - Upserts by email to avoid duplicates
  - Password for all users: Password123!
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  { fullName: 'Olivia Martinez', username: 'olivia.martinez', email: 'olivia.martinez@example.com', location: 'Austin, TX, USA', website: 'https://oliviamartinez.dev', bio: 'Frontend engineer and coffee enthusiast.' },
  { fullName: 'Ethan Patel', username: 'ethan.patel', email: 'ethan.patel@example.com', location: 'Toronto, Canada', website: 'https://ethan.codes', bio: 'Full‑stack developer, TypeScript fan.' },
  { fullName: 'Mia Chen', username: 'mia.chen', email: 'mia.chen@example.com', location: 'San Francisco, CA, USA', website: 'https://miachen.io', bio: 'Design systems and UX lover.' },
  { fullName: 'Liam O’Connor', username: 'liam.oconnor', email: 'liam.oconnor@example.com', location: 'Dublin, Ireland', website: 'https://liamoconnor.dev', bio: 'Building scalable backends.' },
  { fullName: 'Ava Thompson', username: 'ava.thompson', email: 'ava.thompson@example.com', location: 'London, UK', website: 'https://avathompson.uk', bio: 'Data viz and product analytics.' },
  { fullName: 'Noah Müller', username: 'noah.mueller', email: 'noah.mueller@example.com', location: 'Berlin, Germany', website: 'https://noahm.dev', bio: 'Cloud infra and DevOps.' },
  { fullName: 'Sophia Rossi', username: 'sophia.rossi', email: 'sophia.rossi@example.com', location: 'Milan, Italy', website: 'https://sophiarossi.it', bio: 'Creative coder and illustrator.' },
  { fullName: 'Benjamin Kim', username: 'ben.kim', email: 'ben.kim@example.com', location: 'Seoul, South Korea', website: 'https://benkim.dev', bio: 'APIs, databases, and performance.' },
  { fullName: 'Isabella García', username: 'isabella.garcia', email: 'isabella.garcia@example.com', location: 'Madrid, Spain', website: 'https://isabellagarcia.es', bio: 'Web accessibility advocate.' },
  { fullName: 'James Anderson', username: 'james.anderson', email: 'james.anderson@example.com', location: 'Sydney, Australia', website: 'https://jamesanderson.au', bio: 'Mobile and cross‑platform apps.' },
  { fullName: 'Emily Nguyen', username: 'emily.nguyen', email: 'emily.nguyen@example.com', location: 'Ho Chi Minh City, Vietnam', website: 'https://emilynguyen.dev', bio: 'Rustacean and JS tinkerer.' },
  { fullName: 'Alexander Ivanov', username: 'alex.ivanov', email: 'alex.ivanov@example.com', location: 'Sofia, Bulgaria', website: 'https://alexivanov.dev', bio: 'Security and platform engineering.' },
  { fullName: 'Charlotte Dubois', username: 'charlotte.dubois', email: 'charlotte.dubois@example.com', location: 'Paris, France', website: 'https://charlottedubois.fr', bio: 'Product designer turned engineer.' },
  { fullName: 'William Johnson', username: 'will.johnson', email: 'will.johnson@example.com', location: 'New York, NY, USA', website: 'https://willjohnson.dev', bio: 'Realtime systems and WebRTC.' },
  { fullName: 'Amelia Singh', username: 'amelia.singh', email: 'amelia.singh@example.com', location: 'Mumbai, India', website: 'https://ameliasingh.in', bio: 'ML hobbyist and blogger.' },
];

function avatarFor(username) {
  // Unique placeholder avatar per user (no auth required provider)
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;
}

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const password = 'Password123!';
  const hash = await bcrypt.hash(password, rounds);

  console.log('Seeding 15 users...');
  for (const u of users) {
    const result = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        password: hash,
        bio: u.bio,
        website: u.website,
        location: u.location,
        avatar: avatarFor(u.username),
        role: 'USER',
        isActive: true,
        emailVerified: new Date(),
      },
      update: {
        username: u.username,
        fullName: u.fullName,
        bio: u.bio,
        website: u.website,
        location: u.location,
        avatar: avatarFor(u.username),
        isActive: true,
      },
      select: { id: true, email: true, username: true }
    });
    console.log(`✔️  Upserted ${result.email}`);
  }
  console.log('\nDone. Default password for all users: Password123!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


