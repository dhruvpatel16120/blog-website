#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SeedingUtils = require('./utils/seeding-utils');

const postsDir = path.join(__dirname, 'posts');

function runScript(label, filePath, utils) {
  utils.logSection(`📝 Seeding ${label} Posts`);
  try {
    execSync(`node "${filePath}"`, { stdio: 'inherit' });
    utils.logSuccess(`${label} posts seeded successfully`);
  } catch (error) {
    utils.logError(`Error while seeding ${label} posts: ${error.message}`);
    throw error;
  }
}

async function main() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('🚀 Tech Blog Post Seeding Process');
    utils.log('Starting comprehensive post seeding for all categories...', 'white');

    // Get all .js files in posts directory
    const files = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // alphabetical order

    utils.logSection('📋 Found Post Categories');
    files.forEach((file, index) => {
      const label = file
        .replace('seed-', '')
        .replace('-posts.js', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize words
      
      utils.log(`${index + 1}. ${label}`, 'white');
    });

    utils.logSection('🌱 Starting Seeding Process');
    let successCount = 0;
    let totalCount = files.length;

    for (const file of files) {
      const label = file
        .replace('seed-', '')
        .replace('-posts.js', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      try {
        runScript(label, path.join(postsDir, file), utils);
        successCount++;
      } catch (error) {
        utils.logError(`Failed to seed ${label} posts`);
        // Continue with other categories
      }
    }

    utils.logSection('📊 Seeding Results');
    utils.log(`Total Categories: ${totalCount}`, 'white');
    utils.log(`Successful: ${successCount}`, 'green');
    utils.log(`Failed: ${totalCount - successCount}`, successCount === totalCount ? 'green' : 'red');

    if (successCount === totalCount) {
      utils.logSection('✅ All Posts Seeded Successfully');
      utils.log('Your tech blog is now populated with comprehensive content!', 'green');
    } else {
      utils.logSection('⚠️  Partial Seeding Complete');
      utils.log('Some categories failed to seed. Check the errors above.', 'yellow');
    }

  } catch (err) {
    utils.logError(`Failed to run post seeding: ${err.message}`);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Post seeding interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Post seeding terminated');
  process.exit(0);
});

// Run the script
main().catch((err) => {
  console.error('❌ Failed to run post seeding:', err.message);
  process.exit(1);
});
