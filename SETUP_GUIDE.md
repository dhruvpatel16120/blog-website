# Free Setup Guide for Tech Blog Environment Variables

## 🚀 Quick Start - Get Everything Free in 30 Minutes

### 1. Database Setup (PostgreSQL) - FREE
**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. Replace in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb"
   ```

**Option B: Supabase**
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Go to Settings > Database
5. Copy connection string

### 2. Google OAuth - FREE
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 3. GitHub OAuth - FREE
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Application name: "Tech Blog"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID and Client Secret

### 4. Email Service - FREE
**Option A: Resend (Recommended)**
1. Go to https://resend.com
2. Sign up with GitHub
3. Verify domain (or use test domain)
4. Get API key
5. Replace in `.env`:
   ```
   EMAIL_SERVER_HOST="smtp.resend.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="resend"
   EMAIL_SERVER_PASSWORD="your-resend-api-key"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

**Option B: SendGrid**
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify sender email
4. Create API key
5. Use SMTP settings

### 5. File Upload - FREE
**Option A: Cloudinary (Recommended)**
1. Go to https://cloudinary.com
2. Sign up for free account
3. Get Cloud Name, API Key, and API Secret
4. Free tier: 25GB storage, 25GB bandwidth/month

**Option B: Supabase Storage**
1. If using Supabase for database
2. Go to Storage in your project
3. Create new bucket
4. Get API keys

### 6. Analytics - FREE
1. Go to https://analytics.google.com
2. Create new property
3. Copy Measurement ID (G-XXXXXXXXXX)

## 🔧 Complete .env File Template

```env
# Database (Choose one)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"

# Authentication Providers (FREE)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email (FREE with Resend)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload (FREE with Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Analytics (FREE)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Security
JWT_SECRET="your-jwt-secret-key-here"
BCRYPT_ROUNDS=12
```

## 🎯 Step-by-Step Setup

### Step 1: Database (5 minutes)
1. Go to Neon.tech
2. Sign up with GitHub
3. Create project
4. Copy connection string

### Step 2: Authentication (10 minutes)
1. Set up Google OAuth
2. Set up GitHub OAuth
3. Test both providers

### Step 3: Email (5 minutes)
1. Sign up for Resend
2. Get API key
3. Test email sending

### Step 4: File Upload (5 minutes)
1. Sign up for Cloudinary
2. Get API credentials
3. Test image upload

### Step 5: Analytics (5 minutes)
1. Create Google Analytics property
2. Copy Measurement ID
3. Test tracking

## 💡 Pro Tips

1. **Use GitHub for everything** - Most services offer GitHub signup
2. **Start with Neon** - Best free PostgreSQL option
3. **Resend for emails** - Modern API, great free tier
4. **Cloudinary for images** - Generous free tier
5. **Test locally first** - Make sure everything works before deploying

## 🚨 Common Issues & Solutions

**Issue**: "Invalid redirect URI"
**Solution**: Make sure redirect URIs match exactly in OAuth settings

**Issue**: "Database connection failed"
**Solution**: Check if DATABASE_URL is correct and database is accessible

**Issue**: "Email not sending"
**Solution**: Verify email service credentials and domain verification

**Issue**: "Image upload failed"
**Solution**: Check Cloudinary credentials and cloud name

## 🔒 Security Notes

1. **Never commit .env to git**
2. **Use strong NEXTAUTH_SECRET**
3. **Rotate API keys regularly**
4. **Use environment-specific configs**

## 📱 Mobile Testing

All services work on mobile:
- OAuth redirects work on mobile browsers
- File uploads work on mobile
- Email sending works from mobile
- Analytics track mobile users

## 🎉 You're Done!

After following this guide, you'll have:
- ✅ Free PostgreSQL database
- ✅ Free OAuth authentication
- ✅ Free email service
- ✅ Free file storage
- ✅ Free analytics
- ✅ Fully functional tech blog!

Total cost: **$0** 🎯
