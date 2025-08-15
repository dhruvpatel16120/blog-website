#!/usr/bin/env node

/*
  Comprehensive Tech Blog Seeding Script
  Runs all seeding operations in the correct order:
  1. Categories
  2. Tags  
  3. Users
  4. Posts (all categories)
  
  Usage:
    node scripts/dummy_data/seed-all.js
*/

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function runScript(scriptPath, description) {
  logSection(`Running: ${description}`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

async function seedAll() {
  const scriptsDir = path.join(__dirname);
  
  logHeader('🚀 Tech Blog Comprehensive Seeding Process');
  log('This script will seed your entire tech blog with realistic data.', 'white');
  log('Make sure your database is running and Prisma is set up.', 'yellow');

  const steps = [
    {
      path: path.join(scriptsDir, 'seed-categories.js'),
      description: 'Categories Seeding',
      required: true
    },
    {
      path: path.join(scriptsDir, 'seed-tags.js'),
      description: 'Tags Seeding',
      required: true
    },
    {
      path: path.join(scriptsDir, 'seed-users.js'),
      description: 'Users Seeding',
      required: true
    },
    {
      path: path.join(scriptsDir, 'seed-post.js'),
      description: 'Posts Seeding (All Categories)',
      required: true
    }
  ];

  logSection('📋 Seeding Steps');
  steps.forEach((step, index) => {
    log(`${index + 1}. ${step.description}`, step.required ? 'white' : 'cyan');
  });

  logSection('🌱 Starting Seeding Process');
  
  let successCount = 0;
  let failedSteps = [];

  for (const step of steps) {
    const success = runScript(step.path, step.description);
    if (success) {
      successCount++;
    } else {
      failedSteps.push(step.description);
      if (step.required) {
        logError(`Required step failed: ${step.description}`);
        log('Stopping seeding process due to critical failure.', 'red');
        break;
      }
    }
  }

  logSection('📊 Seeding Results');
  log(`Total Steps: ${steps.length}`, 'white');
  log(`Successful: ${successCount}`, 'green');
  log(`Failed: ${steps.length - successCount}`, successCount === steps.length ? 'green' : 'red');

  if (failedSteps.length > 0) {
    logSection('❌ Failed Steps');
    failedSteps.forEach(step => log(`- ${step}`, 'red'));
  }

  if (successCount === steps.length) {
    logSection('🎉 All Seeding Complete!');
    log('Your tech blog is now fully populated with:', 'green');
    log('• Comprehensive tech categories', 'white');
    log('• Rich tag system', 'white');
    log('• Realistic user profiles', 'white');
    log('• High-quality blog posts across all categories', 'white');
    
    logSection('🚀 Next Steps');
    log('1. Start your development server: npm run dev', 'cyan');
    log('2. Visit your blog to see the seeded content', 'cyan');
    log('3. Login with any seeded user (password: Password123!)', 'cyan');
    log('4. Create an admin user: npm run create-admin', 'cyan');
    
  } else {
    logSection('⚠️  Partial Seeding Complete');
    log('Some steps failed. Check the errors above and try again.', 'yellow');
    log('You can run individual seeding scripts to fix specific issues:', 'white');
    failedSteps.forEach(step => {
      const scriptName = step.toLowerCase().replace(/\s+/g, '-');
      log(`• npm run seed:${scriptName}`, 'cyan');
    });
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Seeding interrupted by user', 'yellow');
  log('No changes were made to your database.', 'white');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Seeding terminated', 'yellow');
  process.exit(0);
});

// Run the comprehensive seeding
seedAll().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
