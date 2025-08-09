#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnv() {
  console.log('🚀 Tech Blog Environment Setup\n');
  console.log('This script will help you create a .env file with all the necessary variables.\n');

  const envVars = {};

  // Database
  console.log('📊 DATABASE SETUP');
  console.log('1. Go to https://neon.tech (FREE PostgreSQL)');
  console.log('2. Sign up with GitHub');
  console.log('3. Create new project');
  console.log('4. Copy connection string\n');
  
  envVars.DATABASE_URL = await question('Enter your DATABASE_URL: ');

  // NextAuth
  console.log('\n🔐 NEXTAUTH SETUP');
  envVars.NEXTAUTH_URL = await question('Enter NEXTAUTH_URL (default: http://localhost:3000): ') || 'http://localhost:3000';
  envVars.NEXTAUTH_SECRET = await question('Enter NEXTAUTH_SECRET (generate a random string): ') || generateSecret();

  // Google OAuth
  console.log('\n🔑 GOOGLE OAUTH SETUP');
  console.log('1. Go to https://console.cloud.google.com');
  console.log('2. Create new project');
  console.log('3. Enable Google+ API');
  console.log('4. Create OAuth 2.0 credentials\n');
  
  envVars.GOOGLE_CLIENT_ID = await question('Enter GOOGLE_CLIENT_ID: ');
  envVars.GOOGLE_CLIENT_SECRET = await question('Enter GOOGLE_CLIENT_SECRET: ');

  // GitHub OAuth
  console.log('\n🐙 GITHUB OAUTH SETUP');
  console.log('1. Go to https://github.com/settings/developers');
  console.log('2. Create new OAuth App\n');
  
  envVars.GITHUB_ID = await question('Enter GITHUB_ID: ');
  envVars.GITHUB_SECRET = await question('Enter GITHUB_SECRET: ');

  // Email Service
  console.log('\n📧 EMAIL SERVICE SETUP');
  console.log('1. Go to https://resend.com (FREE tier)');
  console.log('2. Sign up with GitHub');
  console.log('3. Get API key\n');
  
  envVars.EMAIL_SERVER_HOST = await question('Enter EMAIL_SERVER_HOST (default: smtp.resend.com): ') || 'smtp.resend.com';
  envVars.EMAIL_SERVER_PORT = await question('Enter EMAIL_SERVER_PORT (default: 587): ') || '587';
  envVars.EMAIL_SERVER_USER = await question('Enter EMAIL_SERVER_USER (default: resend): ') || 'resend';
  envVars.EMAIL_SERVER_PASSWORD = await question('Enter EMAIL_SERVER_PASSWORD (your API key): ');
  envVars.EMAIL_FROM = await question('Enter EMAIL_FROM (default: noreply@techblog.com): ') || 'noreply@techblog.com';

  // File Upload
  console.log('\n📁 FILE UPLOAD SETUP');
  console.log('1. Go to https://cloudinary.com (FREE tier)');
  console.log('2. Sign up for free account');
  console.log('3. Get Cloud Name, API Key, and API Secret\n');
  
  envVars.CLOUDINARY_CLOUD_NAME = await question('Enter CLOUDINARY_CLOUD_NAME: ');
  envVars.CLOUDINARY_API_KEY = await question('Enter CLOUDINARY_API_KEY: ');
  envVars.CLOUDINARY_API_SECRET = await question('Enter CLOUDINARY_API_SECRET: ');

  // Analytics
  console.log('\n📈 ANALYTICS SETUP');
  console.log('1. Go to https://analytics.google.com');
  console.log('2. Create new property');
  console.log('3. Copy Measurement ID (G-XXXXXXXXXX)\n');
  
  envVars.GOOGLE_ANALYTICS_ID = await question('Enter GOOGLE_ANALYTICS_ID (optional): ') || '';

  // Default values
  envVars.RATE_LIMIT_MAX = '100';
  envVars.RATE_LIMIT_WINDOW_MS = '900000';
  envVars.JWT_SECRET = generateSecret();
  envVars.BCRYPT_ROUNDS = '12';

  // Generate .env content
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ .env file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  console.log('\n🔒 IMPORTANT: Make sure .env is in your .gitignore file');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Test your application');
  console.log('3. Check the admin panel at /admin');

  rl.close();
}

function generateSecret() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

setupEnv().catch(console.error);
