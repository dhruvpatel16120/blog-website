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

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function setupEnv() {
  console.log('🚀 Advanced Tech Blog Environment Setup\n');
  console.log('This script will help you configure your environment variables.\n');

  try {
    // Check if .env already exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env file already exists.');
      const overwrite = await question('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        return;
      }
    }

    console.log('📋 Database Configuration\n');
    console.log('For PostgreSQL (Railway/Heroku/Other):');
    console.log('- Format: postgresql://username:password@host:port/database');
    console.log('- Example: postgresql://user:pass@localhost:5432/techblog\n');

    const databaseUrl = await question('Enter your DATABASE_URL: ');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    console.log('\n🔐 Authentication Configuration\n');
    const nextauthSecret = generateSecret();
    const jwtSecret = generateSecret();

    console.log('\n📧 Email Configuration (Gmail)\n');
    console.log('For Gmail, you need to:');
    console.log('1. Enable 2-factor authentication');
    console.log('2. Generate an App Password');
    console.log('3. Use the App Password instead of your regular password\n');

    const emailServerHost = await question('Email server host (default: smtp.gmail.com): ') || 'smtp.gmail.com';
    const emailServerPort = await question('Email server port (default: 587): ') || '587';
    const emailServerUser = await question('Email username (your Gmail address): ');
    const emailServerPassword = await question('Email password (Gmail App Password): ');
    const emailFrom = await question('From email address (default: noreply@techblog.com): ') || 'noreply@techblog.com';

    console.log('\n🌐 Application Configuration\n');
    const nextAuthUrl = await question('NEXTAUTH_URL (default: http://localhost:3000): ') || 'http://localhost:3000';
    const bcryptRounds = await question('BCRYPT_ROUNDS (default: 12): ') || '12';

    console.log('\n🔒 Security Configuration\n');
    const sessionMaxAge = await question('Session max age in seconds (default: 2592000 - 30 days): ') || '2592000';
    const adminSessionMaxAge = await question('Admin session max age in seconds (default: 86400 - 24 hours): ') || '86400';

    console.log('\n📊 Advanced Features\n');
    const enableAnalytics = await question('Enable analytics tracking? (y/N): ') || 'N';
    const enableFileUpload = await question('Enable file uploads? (y/N): ') || 'Y';
    const maxFileSize = await question('Max file size in MB (default: 5): ') || '5';

    console.log('\n📝 Editor Configuration\n');
    console.log('For TinyMCE Editor:');
    console.log('1. Visit: https://www.tiny.cloud/auth/signup/');
    console.log('2. Create a free account');
    console.log('3. Get your API key from the dashboard\n');
    const tinymceApiKey = await question('Enter your TinyMCE API key (optional for development): ') || '';

    // Generate environment variables
    const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Authentication
NEXTAUTH_SECRET="${nextauthSecret}"
NEXTAUTH_URL="${nextAuthUrl}"
JWT_SECRET="${jwtSecret}"
BCRYPT_ROUNDS=${bcryptRounds}

# Email Configuration (Gmail)
EMAIL_SERVER_HOST="${emailServerHost}"
EMAIL_SERVER_PORT=${emailServerPort}
EMAIL_SERVER_USER="${emailServerUser}"
EMAIL_SERVER_PASSWORD="${emailServerPassword}"
EMAIL_FROM="${emailFrom}"

# Session Configuration
SESSION_MAX_AGE=${sessionMaxAge}
ADMIN_SESSION_MAX_AGE=${adminSessionMaxAge}

# File Upload Configuration
ENABLE_FILE_UPLOAD=${enableFileUpload.toLowerCase() === 'y' ? 'true' : 'false'}
MAX_FILE_SIZE=${maxFileSize}

# Analytics Configuration
ENABLE_ANALYTICS=${enableAnalytics.toLowerCase() === 'y' ? 'true' : 'false'}

# TinyMCE Editor
NEXT_PUBLIC_TINYMCE_API_KEY="${tinymceApiKey}"

# Development Configuration
NODE_ENV=development
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');

    console.log('\n📋 Configuration Summary:');
    console.log(`- Database: PostgreSQL configured`);
    console.log(`- Authentication: NextAuth.js with JWT`);
    console.log(`- Email: Gmail SMTP configured`);
    console.log(`- Sessions: ${sessionMaxAge}s for users, ${adminSessionMaxAge}s for admins`);
    console.log(`- File Upload: ${enableFileUpload.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`);
    console.log(`- Analytics: ${enableAnalytics.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`);

    console.log('\n🔧 Next Steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npm run db:push');
    console.log('3. Run: npm run setup-db');
    console.log('4. Run: npm run create-admin');
    console.log('5. Run: npm run dev');
    console.log('\n🌐 Access Points:');
    console.log('- User Login: http://localhost:3000/auth/signin');
    console.log('- User Registration: http://localhost:3000/auth/signup');
    console.log('- Admin Login: http://localhost:3000/admin/login');
    console.log('- Database Studio: npm run db:studio');

    console.log('\n⚠️  Important Notes:');
    console.log('- Keep your .env file secure and never commit it to version control');
    console.log('- For production, update NEXTAUTH_URL to your domain');
    console.log('- Consider using environment-specific .env files (.env.production)');
    console.log('- Regularly rotate your secrets in production');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure you have proper database access');
    console.log('2. Check your Gmail App Password settings');
    console.log('3. Verify your DATABASE_URL format');
  } finally {
    rl.close();
  }
}

setupEnv().catch(console.error);
