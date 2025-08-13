# TechBlog — Modern Blog Platform (Next.js 15 + Prisma)

> A production‑ready, full‑stack blog platform with authentication, comments, admin panel, categories & tags, search, and beautiful UI.

<p align="center">
  <a href="https://techblog-website.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img alt="TechBlog Banner" src="https://images.unsplash.com/photo-1519332950545-b0a34f7fb7e0?q=80&w=1400&auto=format&fit=crop" style="max-width: 100%; border-radius: 12px;"/>
  </a>
</p>

<p align="center">
  <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js"/>
  </a>
  <a href="https://www.prisma.io/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma"/>
  </a>
  <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/PostgreSQL-DB-336791?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  </a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
  </a>
  <a href="https://authjs.dev/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/NextAuth.js-Auth-000000?logo=auth0&logoColor=white" alt="NextAuth"/>
  </a>
</p>

<p align="center">
  <a href="https://techblog-website.vercel.app/" target="_blank" rel="noopener noreferrer"><b>Live Site</b></a> ·
  <a href="https://github.com/dhruvpatel16120" target="_blank" rel="noopener noreferrer"><b>GitHub</b></a> ·
  <a href="https://www.linkedin.com/in/dhruvpatel16120/" target="_blank" rel="noopener noreferrer"><b>LinkedIn</b></a> ·
  <a href="https://dhruvpatelofficial.vercel.app/" target="_blank" rel="noopener noreferrer"><b>Portfolio</b></a>
</p>


## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screens & Flows](#screens--flows)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database & Prisma](#database--prisma)
- [Run & Build](#run--build)
- [Project Structure](#project-structure)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License & Disclaimer](#license--disclaimer)


## Overview
TechBlog is a modern, content‑focused blog platform built with Next.js (App Router) and Prisma. It offers a polished reading experience, powerful admin tools for content and community management, and a robust public UI with categories, tags, search, and comments.

- Live: [`techblog-website.vercel.app`](https://techblog-website.vercel.app/)
- Author GitHub: [`@dhruvpatel16120`](https://github.com/dhruvpatel16120)
- Portfolio: [`dhruvpatelofficial.vercel.app`](https://dhruvpatelofficial.vercel.app/)
- LinkedIn: [`/in/dhruvpatel16120/`](https://www.linkedin.com/in/dhruvpatel16120/)


## Features
- **Public**
  - Beautiful home page with Featured, Trending, Explore Topics, Latest
  - Category and Tag pages with fully working pagination and filters
  - Blog listing with sorting, search, and page controls
  - Post page with reading progress, TOC, social share, and comments
  - Contact page with validated form and backend persistence
- **Comments**
  - Authenticated users can add, edit, reply, delete their comments
  - Rate limits, length validation, reply limits
  - Admin moderation capabilities
- **Admin Panel**
  - Dashboard stats (users, posts, comments, categories, tags)
  - Manage Posts, Categories, Tags, Users
  - Comment management (approve/reject/delete)
  - Contact management (filter, review, respond, delete with restrictions)
- **Authentication**
  - NextAuth session with roles (user/admin)
  - Middleware‑based route protection for `/admin` and admin APIs
- **Performance & UX**
  - Responsive layout, dark mode aware styling
  - Image optimization with proper `sizes`
  - Fast refresh and statically optimized pages where applicable


## Tech Stack
- Framework: **Next.js 15 (App Router)**
- Language: **TypeScript/JavaScript (ESNext)**
- Styling: **Tailwind CSS**, **Heroicons**
- Auth: **NextAuth.js**
- Database: **PostgreSQL** with **Prisma ORM**
- Email (optional, ready to add): **Nodemailer/SMTP**
- Hosting: **Vercel** (recommended)


## Architecture
- App Router with server components for data‑fetching and UI composition
- Prisma schema models for Post, Category, Tag, Comment, Like, Contact, User, Admin
- API routes under `src/app/api/**` for CRUD, moderation, and utility endpoints
- Middleware for maintenance mode and admin protection


## Screens & Flows
- **Home**
  - Search → `/blog?search=query`
  - Explore Topics → `/categories/{slug}`
- **Categories & Tags**
  - Pagination (First/Prev/Numbered/Next/Last)
  - Sort variants and in‑page search (category page)
- **Blog**
  - Listing with filters (sort, search)
  - Detail with comments and related UI
- **Admin**
  - Comments, Contacts, Posts, Users, Categories, Tags
  - Auth guard redirects to `/admin/login` when not authenticated


## Getting Started
**Prerequisites**
- Node.js 18+
- PostgreSQL 13+
- pnpm, npm, or yarn

**Clone & Install**
```bash
# Clone
git clone <your-repo-url>
cd blog-website-main

# Install deps
npm install
# or: pnpm install / yarn
```

**Create `.env`**
```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-strong-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional (email notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="apikey-or-username"
SMTP_PASS="smtp-password"
EMAIL_FROM="TechBlog <no-reply@yourdomain.com>"
```


## Database & Prisma
```bash
# Generate Prisma client
npx prisma generate

# Create DB schema (dev)
npx prisma migrate dev -n init

# (Optional) Visualize
npx prisma studio
```


## Run & Build
```bash
# Dev
npm run dev

# Prod build
npm run build
npm start
```


## Project Structure
```
src/
  app/
    (public)/
      page.js                 # Home
      blog/                   # Blog listing & post pages
      categories/             # Categories listing + [slug]
      tags/                   # Tags listing + [slug]
      about/                  # About page
      contact/                # Contact page
    admin/                    # Admin panel pages
    api/                      # API routes (auth, comments, admin, contact, etc.)
  components/
    blog/                     # Blog UI (cards, comments, etc.)
    admin/                    # Admin layout and components
    forms/                    # Contact form
  lib/                        # db (Prisma), auth, utils
  prisma/
    schema.prisma             # Prisma models
```


## FAQ
- **Why do I see maintenance warnings?**
  - Maintenance mode is controlled via `MAINTENANCE_MODE` env in middleware. Ensure it’s set correctly for your environment.
- **Does the contact form send emails?**
  - Currently it stores submissions in DB (Contacts). SMTP hooks can be added for auto‑reply/admin alerts. Open an issue if you want this implemented by default.
- **Pagination/search throws errors in server console?**
  - We standardized dynamic routes to avoid mixed param names. If you added custom routes, ensure consistent `[slug]` naming per path.


## Contributing
PRs welcome! Please:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/awesome`
3. Commit with conventional messages
4. Open a PR with screenshots/notes


## License & Disclaimer
- This project’s content and code are provided for educational and demonstration purposes. Please review and choose a license appropriate for your usage before redistribution.
- External links:
  - GitHub: [`@dhruvpatel16120`](https://github.com/dhruvpatel16120)
  - LinkedIn: [`dhruvpatel16120`](https://www.linkedin.com/in/dhruvpatel16120/)
  - Portfolio: [`dhruvpatelofficial.vercel.app`](https://dhruvpatelofficial.vercel.app/)
  - Live: [`techblog-website.vercel.app`](https://techblog-website.vercel.app/)

> Logos and product names are trademarks of their respective owners.

---

Made with ❤️ using Next.js, Prisma, and Tailwind.
Created By Dhruv Patel  