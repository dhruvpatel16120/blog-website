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

### 2. Email Service (Gmail) - FREE
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use your Gmail credentials in `.env`:
   ```
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-gmail@gmail.com"
   EMAIL_SERVER_PASSWORD="your-gmail-app-password"
   EMAIL_FROM="noreply@techblog.com"
   ```

## 🔧 Complete .env File Template

```env
# Database (Choose one)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="auto-generated-secret-key"

# Email (Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-gmail@gmail.com"
EMAIL_SERVER_PASSWORD="your-gmail-app-password"
EMAIL_FROM="noreply@techblog.com"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Security
JWT_SECRET="auto-generated-jwt-secret"
BCRYPT_ROUNDS=12
```

## 🎯 Step-by-Step Setup

### Step 1: Database (5 minutes)
1. Go to Neon.tech
2. Sign up with GitHub
3. Create project
4. Copy connection string

### Step 2: Authentication (5 minutes)
1. Run the setup script: `npm run setup`
2. The script will auto-generate NEXTAUTH_SECRET and JWT_SECRET
3. Test authentication at `/auth/signup`

### Step 3: Email (5 minutes)
1. Enable 2FA on your Gmail account
2. Generate App Password
3. Test email sending

## 💡 Pro Tips

1. **Use GitHub for everything** - Most services offer GitHub signup
2. **Start with Neon** - Best free PostgreSQL option
3. **Gmail for emails** - Free, reliable, and easy to set up
4. **Test locally first** - Make sure everything works before deploying
5. **Use the setup script** - Run `npm run setup` for automated configuration

## 🚨 Common Issues & Solutions

**Issue**: "Database connection failed"
**Solution**: Check if DATABASE_URL is correct and database is accessible

**Issue**: "Email not sending"
**Solution**: Verify Gmail App Password and 2FA is enabled

**Issue**: "Authentication failed"
**Solution**: Make sure NEXTAUTH_SECRET is properly generated

**Issue**: "Invalid credentials"
**Solution**: Check that your Gmail App Password is correct

## 🔒 Security Notes

1. **Never commit .env to git**
2. **Auto-generated secrets are secure** - The setup script uses crypto.randomBytes()
3. **Use Gmail App Passwords** - Never use your main Gmail password
4. **Enable 2FA on Gmail** - Required for App Passwords

## 📱 Mobile Testing

All services work on mobile:
- Authentication works on mobile browsers
- Email sending works from mobile
- Database access works on mobile

## 🎉 You're Done!

After following this guide, you'll have:
- ✅ Free PostgreSQL database
- ✅ Secure authentication (credentials only)
- ✅ Free email service with Gmail
- ✅ Fully functional tech blog!

Total cost: **$0** 🎯

## 🚀 Quick Setup Command

Run this command to automatically set up your environment:

```bash
npm run setup
```

This will:
1. Ask for your database URL
2. Ask for your Gmail credentials
3. Auto-generate secure secrets
4. Create your `.env` file
5. Guide you through the next steps
