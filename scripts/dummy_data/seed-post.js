#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const postsDir = path.join(__dirname, 'posts');

function runScript(label, filePath) {
  console.log(`\nSeeding ${label} posts...`);
  try {
    execSync(`node "${filePath}"`, { stdio: 'inherit' });
    console.log('Done.');
  } catch (error) {
    console.error(`❌ Error while seeding ${label} posts:`, error.message);
    process.exit(1);
  }
}

console.log('--- Starting post seeding process ---');

try {
  // Get all .js files in posts directory
  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // alphabetical order

  files.forEach(file => {
    const label = file
      .replace('seed-', '')
      .replace('-posts.js', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize words

    runScript(label, path.join(postsDir, file));
  });

  console.log('\n✅ All posts seeded successfully.');
} catch (err) {
  console.error('❌ Failed to run post seeding:', err.message);
  process.exit(1);
}
