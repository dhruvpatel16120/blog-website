# Tech Blog - Modern Next.js Blog Platform

A production-ready, modern tech blog platform built with Next.js, featuring a responsive design, admin panel, authentication system, and more.

## Features

- **Modern UI**: Responsive design with Tailwind CSS
- **Authentication**: Secure credential-based authentication system
- **Admin Panel**: Complete content management system
- **Blog Features**: Categories, tags, search, and more
- **SEO Optimized**: Meta tags, Open Graph, and more

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your database credentials and other settings.

4. Run the database setup script:

```bash
node scripts/setup-database.js
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm run start
# or
yarn start
```

### Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository
2. Import the project in Vercel
3. Set up the required environment variables
4. Deploy

## Learn More

Check out the [ROADMAP.md](./ROADMAP.md) file for more details on the project's development plan and progress.
