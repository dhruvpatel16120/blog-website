# 🚀 Quick Start - Get Your Tech Blog Running in 5 Minutes

## ⚡ Super Fast Setup

### Option 1: Interactive Setup (Recommended)
```bash
npm run setup
```
This will walk you through setting up all environment variables interactively!

### Option 2: Manual Setup
1. Copy `env.example` to `.env`
2. Fill in the values (see SETUP_GUIDE.md for free services)
3. Run the app

## 🎯 What You Get for FREE

| Service | Free Tier | Setup Time |
|---------|-----------|------------|
| **Database** | Neon: 3 DBs, 500MB | 2 min |
| **Auth** | Google + GitHub OAuth | 5 min |
| **Email** | Resend: 3,000/month | 3 min |
| **Storage** | Cloudinary: 25GB | 2 min |
| **Analytics** | Google Analytics | 2 min |

**Total Cost: $0** 🎉

## 🚀 Launch Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (interactive)
npm run setup

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma db push

# 5. Start development server
npm run dev
```

## 🌐 Your Blog Will Be Available At

- **Homepage**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Blog**: http://localhost:3000/blog
- **Sign In**: http://localhost:3000/auth/signin

## 🔑 Admin Access

After first run, create an admin user:
1. Go to http://localhost:3000/auth/signup
2. Sign up with Google/GitHub
3. Check your database and set `role: 'ADMIN'` for your user
4. Access admin panel at /admin

## 📱 Features You Get

- ✅ **Responsive Design** - Works on all devices
- ✅ **Authentication** - Google + GitHub login
- ✅ **Admin Panel** - Manage posts, comments, analytics
- ✅ **Blog System** - Markdown support, categories, tags
- ✅ **Search** - Full-text search functionality
- ✅ **Contact Form** - Email notifications
- ✅ **SEO Optimized** - Meta tags, sitemap
- ✅ **Dark/Light Theme** - User preference
- ✅ **Reading Progress** - Track reading position
- ✅ **Social Sharing** - Share on social media

## 🚨 Troubleshooting

**"Prisma client not initialized"**
```bash
npx prisma generate
```

**"Database connection failed"**
- Check your DATABASE_URL in .env
- Make sure database is accessible

**"OAuth redirect error"**
- Verify redirect URIs in OAuth settings
- Check NEXTAUTH_URL in .env

## 🎉 You're Ready!

After following these steps, you'll have a fully functional tech blog with:
- Modern Next.js 15 architecture
- Professional admin panel
- Responsive design
- Authentication system
- Database management
- File uploads
- Email notifications
- Analytics tracking

**Total setup time: 5-10 minutes** ⚡
