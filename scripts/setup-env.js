#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

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
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
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

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function selectOption(options, questionText) {
  console.log(`\n${colors.cyan}${questionText}${colors.reset}`);
  options.forEach((option, index) => {
    console.log(`${colors.yellow}${index + 1}.${colors.reset} ${option.label}`);
  });
  
  while (true) {
    const answer = await question(`\n${colors.white}Select option (1-${options.length}): ${colors.reset}`);
    const selection = parseInt(answer) - 1;
    
    if (selection >= 0 && selection < options.length) {
      return options[selection].value;
    }
    
    logError(`Please select a number between 1 and ${options.length}`);
  }
}

async function confirmAction(message) {
  const answer = await question(`${colors.yellow}${message} (y/N): ${colors.reset}`);
  return answer.toLowerCase() === 'y';
}

async function setupEnv() {
  console.clear();
  logHeader('🚀 Advanced Tech Blog Environment Setup Wizard');
  log('Welcome to the Tech Blog environment configuration wizard!', 'white');
  log('This tool will help you set up all necessary environment variables for your blog.', 'white');

  try {
    // Check if .env already exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      logWarning('.env file already exists.');
      const overwrite = await confirmAction('Do you want to overwrite it?');
      if (!overwrite) {
        logInfo('Setup cancelled. Your existing .env file remains unchanged.');
        return;
      }
    }

    logSection('📊 Database Configuration');
    
    const databaseOptions = [
      { label: 'PostgreSQL (Railway/Heroku/AWS)', value: 'postgresql' },
      { label: 'PostgreSQL (Local)', value: 'postgresql-local' },
      { label: 'PostgreSQL (Supabase)', value: 'supabase' },
      { label: 'PostgreSQL (Neon)', value: 'neon' }
    ];
    
    const databaseType = await selectOption(databaseOptions, 'Select your database provider:');
    
    let databaseUrl;
    if (databaseType === 'postgresql-local') {
      logInfo('For local PostgreSQL setup:');
      log('Format: postgresql://username:password@localhost:5432/database', 'white');
      log('Example: postgresql://postgres:mypassword@localhost:5432/techblog', 'white');
      databaseUrl = await question(`${colors.white}Enter your DATABASE_URL: ${colors.reset}`);
    } else if (databaseType === 'supabase') {
      logInfo('For Supabase:');
      log('1. Go to your Supabase project dashboard', 'white');
      log('2. Navigate to Settings > Database', 'white');
      log('3. Copy the connection string', 'white');
      databaseUrl = await question(`${colors.white}Enter your Supabase DATABASE_URL: ${colors.reset}`);
    } else if (databaseType === 'neon') {
      logInfo('For Neon:');
      log('1. Go to your Neon dashboard', 'white');
      log('2. Click on your database', 'white');
      log('3. Copy the connection string', 'white');
      databaseUrl = await question(`${colors.white}Enter your Neon DATABASE_URL: ${colors.reset}`);
    } else {
      logInfo('For other PostgreSQL providers:');
      log('Format: postgresql://username:password@host:port/database', 'white');
      databaseUrl = await question(`${colors.white}Enter your DATABASE_URL: ${colors.reset}`);
    }

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    logSection('🔐 Authentication & Security');
    
    const nextauthSecret = generateSecret();
    const jwtSecret = generateSecret();

    logSuccess(`Generated NEXTAUTH_SECRET: ${nextauthSecret.substring(0, 16)}...`);
    logSuccess(`Generated JWT_SECRET: ${jwtSecret.substring(0, 16)}...`);

    const bcryptRounds = await question(`${colors.white}BCRYPT_ROUNDS (default: 12): ${colors.reset}`) || '12';
    
    logSection('📧 Email Configuration');
    
    const emailProviders = [
      { label: 'Gmail (Recommended for development)', value: 'gmail' },
      { label: 'Outlook/Hotmail', value: 'outlook' },
      { label: 'Yahoo Mail', value: 'yahoo' },
      { label: 'Custom SMTP Server', value: 'custom' }
    ];
    
    const emailProvider = await selectOption(emailProviders, 'Select your email provider:');
    
    let emailConfig = {};
    
    if (emailProvider === 'gmail') {
      logInfo('Gmail Setup Instructions:');
      log('1. Enable 2-factor authentication on your Google account', 'white');
      log('2. Generate an App Password: Google Account > Security > App Passwords', 'white');
      log('3. Use the App Password instead of your regular password', 'white');
      
      emailConfig.host = 'smtp.gmail.com';
      emailConfig.port = '587';
      emailConfig.secure = false;
    } else if (emailProvider === 'outlook') {
      emailConfig.host = 'smtp-mail.outlook.com';
      emailConfig.port = '587';
      emailConfig.secure = false;
    } else if (emailProvider === 'yahoo') {
      emailConfig.host = 'smtp.mail.yahoo.com';
      emailConfig.port = '587';
      emailConfig.secure = false;
    } else {
      emailConfig.host = await question(`${colors.white}SMTP Host: ${colors.reset}`);
      emailConfig.port = await question(`${colors.white}SMTP Port (default: 587): ${colors.reset}`) || '587';
      const securePort = await question(`${colors.white}Use secure connection (SSL/TLS)? (y/N): ${colors.reset}`);
      emailConfig.secure = securePort.toLowerCase() === 'y';
    }
    
    const emailServerUser = await question(`${colors.white}Email username: ${colors.reset}`);
    const emailServerPassword = await question(`${colors.white}Email password/App Password: ${colors.reset}`);
    
    // Auto-generate email from based on email server user
    const emailFrom = await question(`${colors.white}From email address (default: ${emailServerUser}): ${colors.reset}`) || emailServerUser;
    
    logSection('🌐 Application Configuration');
    
    const environmentOptions = [
      { label: 'Development (localhost)', value: 'development' },
      { label: 'Staging', value: 'staging' },
      { label: 'Production', value: 'production' }
    ];
    
    const environment = await selectOption(environmentOptions, 'Select your environment:');
    
    let nextAuthUrl;
    if (environment === 'development') {
      nextAuthUrl = 'http://localhost:3000';
    } else if (environment === 'staging') {
      nextAuthUrl = await question(`${colors.white}Enter your staging URL: ${colors.reset}`);
    } else {
      nextAuthUrl = await question(`${colors.white}Enter your production URL: ${colors.reset}`);
    }
    
    if (!validateUrl(nextAuthUrl)) {
      throw new Error('Invalid URL format');
    }
    
    logSection('⚙️ Advanced Features');
    
    const enableFileUpload = await confirmAction('Enable file uploads?');
    let maxFileSize = '5';
    if (enableFileUpload) {
      maxFileSize = await question(`${colors.white}Max file size in MB (default: 5): ${colors.reset}`) || '5';
    }
    
    const enableAnalytics = await confirmAction('Enable analytics tracking?');
    const enableComments = await confirmAction('Enable user comments?');
    const enableUserProfiles = await confirmAction('Enable user profiles?');
    
    logSection('🔧 Maintenance Mode');
    const enableMaintenanceMode = await confirmAction('Enable maintenance mode by default?');
    const maintenanceMessage = await question(`${colors.white}Maintenance message (default: Site is under maintenance): ${colors.reset}`) || 'Site is under maintenance';
    
    logSection('📝 Editor Configuration');
    
    const editorOptions = [
      { label: 'TinyMCE (Recommended)', value: 'tinymce' },
      { label: 'Markdown Editor', value: 'markdown' },
      { label: 'Rich Text Editor', value: 'richtext' }
    ];
    
    const editorType = await selectOption(editorOptions, 'Select your content editor:');
    
    let tinymceApiKey = '';
    if (editorType === 'tinymce') {
      logInfo('TinyMCE Setup:');
      log('1. Visit: https://www.tiny.cloud/auth/signup/', 'white');
      log('2. Create a free account', 'white');
      log('3. Get your API key from the dashboard', 'white');
      tinymceApiKey = await question(`${colors.white}Enter your TinyMCE API key (optional for development): ${colors.reset}`);
    }
    
    logSection('🔒 Session Configuration');
    
    const sessionOptions = [
      { label: 'Short (1 hour)', value: '3600' },
      { label: 'Medium (24 hours)', value: '86400' },
      { label: 'Long (7 days)', value: '604800' },
      { label: 'Extended (30 days)', value: '2592000' },
      { label: 'Custom', value: 'custom' }
    ];
    
    const sessionDuration = await selectOption(sessionOptions, 'Select user session duration:');
    let sessionMaxAge = sessionDuration;
    
    if (sessionDuration === 'custom') {
      sessionMaxAge = await question(`${colors.white}Enter session duration in seconds: ${colors.reset}`);
    }
    
    const adminSessionOptions = [
      { label: 'Short (30 minutes)', value: '1800' },
      { label: 'Medium (2 hours)', value: '7200' },
      { label: 'Long (8 hours)', value: '28800' },
      { label: 'Extended (24 hours)', value: '86400' },
      { label: 'Custom', value: 'custom' }
    ];
    
    const adminSessionDuration = await selectOption(adminSessionOptions, 'Select admin session duration:');
    let adminSessionMaxAge = adminSessionDuration;
    
    if (adminSessionDuration === 'custom') {
      adminSessionMaxAge = await question(`${colors.white}Enter admin session duration in seconds: ${colors.reset}`);
    }
    
    logSection('🎨 Branding & Customization');
    
    const platformName = await question(`${colors.white}Platform name (default: Tech Blog): ${colors.reset}`) || 'Tech Blog';
    const platformUrl = await question(`${colors.white}Platform URL (default: ${nextAuthUrl}): ${colors.reset}`) || nextAuthUrl;
    const supportEmail = await question(`${colors.white}Support email (default: ${emailFrom}): ${colors.reset}`) || emailFrom;
    
    const brandColors = [
      { label: 'Blue (Default)', value: { primary: '#2563eb', dark: '#1e40af' } },
      { label: 'Green', value: { primary: '#059669', dark: '#047857' } },
      { label: 'Purple', value: { primary: '#7c3aed', dark: '#5b21b6' } },
      { label: 'Red', value: { primary: '#dc2626', dark: '#b91c1c' } },
      { label: 'Custom', value: 'custom' }
    ];
    
    const brandColorChoice = await selectOption(brandColors, 'Select your brand color scheme:');
    let brandPrimary, brandPrimaryDark;
    
    if (brandColorChoice === 'custom') {
      brandPrimary = await question(`${colors.white}Primary color (hex, e.g., #2563eb): ${colors.reset}`);
      brandPrimaryDark = await question(`${colors.white}Dark primary color (hex, e.g., #1e40af): ${colors.reset}`);
    } else {
      brandPrimary = brandColorChoice.primary;
      brandPrimaryDark = brandColorChoice.dark;
    }

    // Generate environment variables
    const envContent = `# ========================================
# Tech Blog Environment Configuration
# Generated on: ${new Date().toISOString()}
# ========================================

# Database Configuration
DATABASE_URL="${databaseUrl}"

# Authentication & Security
NEXTAUTH_SECRET="${nextauthSecret}"
NEXTAUTH_URL="${nextAuthUrl}"
JWT_SECRET="${jwtSecret}"
BCRYPT_ROUNDS=${bcryptRounds}

# Email Configuration
EMAIL_SERVER_HOST="${emailConfig.host}"
EMAIL_SERVER_PORT=${emailConfig.port}
EMAIL_SERVER_USER="${emailServerUser}"
EMAIL_SERVER_PASSWORD="${emailServerPassword}"
EMAIL_FROM="${emailFrom}"
SUPPORT_EMAIL="${supportEmail}"
EMAIL_SECURE=${emailConfig.secure}

# Session Configuration
SESSION_MAX_AGE=${sessionMaxAge}
ADMIN_SESSION_MAX_AGE=${adminSessionMaxAge}

# Platform Configuration
PLATFORM_NAME="${platformName}"
PLATFORM_URL="${platformUrl}"
BRAND_PRIMARY_COLOR="${brandPrimary}"
BRAND_PRIMARY_DARK="${brandPrimaryDark}"

# Feature Flags
ENABLE_FILE_UPLOAD=${enableFileUpload}
ENABLE_ANALYTICS=${enableAnalytics}
ENABLE_COMMENTS=${enableComments}
ENABLE_USER_PROFILES=${enableUserProfiles}
MAX_FILE_SIZE=${maxFileSize}

# Maintenance Mode
MAINTENANCE_MODE=${enableMaintenanceMode}
MAINTENANCE_MESSAGE="${maintenanceMessage}"

# Editor Configuration
EDITOR_TYPE="${editorType}"
NEXT_PUBLIC_TINYMCE_API_KEY="${tinymceApiKey}"

# Environment
NODE_ENV=${environment}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    
    logHeader('🎉 Setup Complete!');
    logSuccess('.env file created successfully!');
    
    logSection('📋 Configuration Summary');
    console.log(`${colors.cyan}Database:${colors.reset} ${databaseType} configured`);
    console.log(`${colors.cyan}Authentication:${colors.reset} NextAuth.js with JWT`);
    console.log(`${colors.cyan}Email:${colors.reset} ${emailProvider} SMTP configured`);
    console.log(`${colors.cyan}Environment:${colors.reset} ${environment}`);
    console.log(`${colors.cyan}User Sessions:${colors.reset} ${Math.round(sessionMaxAge / 3600)} hours`);
    console.log(`${colors.cyan}Admin Sessions:${colors.reset} ${Math.round(adminSessionMaxAge / 3600)} hours`);
    console.log(`${colors.cyan}File Upload:${colors.reset} ${enableFileUpload ? 'Enabled' : 'Disabled'}`);
    console.log(`${colors.cyan}Analytics:${colors.reset} ${enableAnalytics ? 'Enabled' : 'Disabled'}`);
    console.log(`${colors.cyan}Maintenance Mode:${colors.reset} ${enableMaintenanceMode ? 'Enabled' : 'Disabled'}`);
    console.log(`${colors.cyan}Editor:${colors.reset} ${editorType}`);
    
    logSection('🔧 Next Steps');
    log('1. Run: npm run db:generate', 'white');
    log('2. Run: npm run db:push', 'white');
    log('3. Run: npm run setup-db', 'white');
    log('4. Run: npm run create-admin', 'white');
    log('5. Run: npm run dev', 'white');
    
    logSection('🌐 Access Points');
    log(`User Login: ${nextAuthUrl}/auth/signin`, 'white');
    log(`User Registration: ${nextAuthUrl}/auth/signup`, 'white');
    log(`Admin Login: ${nextAuthUrl}/admin/login`, 'white');
    log(`Database Studio: npm run db:studio`, 'white');
    
    logSection('⚠️  Important Notes');
    log('• Keep your .env file secure and never commit it to version control', 'yellow');
    log('• For production, update NEXTAUTH_URL to your domain', 'yellow');
    log('• Consider using environment-specific .env files (.env.production)', 'yellow');
    log('• Regularly rotate your secrets in production', 'yellow');
    log('• Test email functionality before going live', 'yellow');
    
    logSection('🎯 Quick Start Commands');
    log('npm run setup-db     # Setup database tables', 'cyan');
    log('npm run create-admin # Create admin user', 'cyan');
    log('npm run dev          # Start development server', 'cyan');
    log('npm run build        # Build for production', 'cyan');

  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    logSection('🔧 Troubleshooting');
    log('1. Ensure you have proper database access', 'white');
    log('2. Check your email provider settings', 'white');
    log('3. Verify your DATABASE_URL format', 'white');
    log('4. Make sure all required fields are filled', 'white');
  } finally {
    rl.close();
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Setup interrupted by user', 'yellow');
  log('No changes were made to your environment.', 'white');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Setup terminated', 'yellow');
  process.exit(0);
});

setupEnv().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
