#!/usr/bin/env node

/*
  Seeds 10 realistic blog posts with categories and tags.
  - Uses the first existing user as author, or creates a seed author if none exists
  - Upserts categories and tags
  - Generates unique slugs
  - Sets published, readTime, viewCount, featured

  Usage:
    node scripts/dummy_data/seed-posts.js
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function nowMinusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const POSTS = [
  {
    title: 'Mastering Next.js 15 Performance: RSC, Streaming, and Caching',
    excerpt:
      'A practical deep-dive into performance features in Next.js 15, including server components, streaming, and data caching strategies.',
    categories: ['technology', 'web-development'],
    tags: ['nextjs', 'react', 'performance', 'caching'],
  },
  {
    title: 'State Management in React 19: Signals vs Context vs Query',
    excerpt:
      'Understand when to use Signals, Context, or Data Fetching libraries for scalable state management in React 19 apps.',
    categories: ['programming', 'technology'],
    tags: ['react', 'state', 'architecture'],
  },
  {
    title: 'Prisma Power Tips: Migrations, Indexes, and Query Optimization',
    excerpt:
      'Production-ready Prisma tips for safe migrations, efficient indexes, and optimized queries with PostgreSQL.',
    categories: ['database', 'programming'],
    tags: ['prisma', 'postgresql', 'performance'],
  },
  {
    title: 'Tailwind CSS Patterns for Accessible, Scalable Design Systems',
    excerpt:
      'Build robust, accessible UI systems with Tailwind CSS: tokens, composition, and dark mode patterns.',
    categories: ['design', 'web-development'],
    tags: ['css', 'tailwind', 'accessibility'],
  },
  {
    title: 'Designing HTTP APIs in 2025: REST, RPC, and Streaming',
    excerpt:
      'Modern API patterns with Node.js: choosing REST vs RPC, pagination, idempotency, and streaming updates.',
    categories: ['technology', 'programming'],
    tags: ['api', 'nodejs', 'architecture'],
  },
  {
    title: 'Secure Auth with NextAuth: Sessions, JWT, and Role-Based Access',
    excerpt:
      'Step-by-step guide to a secure authentication stack with NextAuth, including admin and moderator roles.',
    categories: ['technology'],
    tags: ['auth', 'nextauth', 'security'],
  },
  {
    title: 'PostgreSQL Transactions and Concurrency Control with Prisma',
    excerpt:
      'Practical patterns for transactions, retries, and safe concurrent updates using Prisma and PostgreSQL.',
    categories: ['database'],
    tags: ['postgresql', 'prisma', 'transactions'],
  },
  {
    title: 'SEO for Next.js: Metadata, Sitemaps, and Edge Rendering',
    excerpt:
      'Everything you need to rank: dynamic metadata, Open Graph, sitemaps, and edge rendering strategies.',
    categories: ['technology', 'web-development'],
    tags: ['seo', 'nextjs', 'edge'],
  },
  {
    title: 'CI/CD for React and Next.js: GitHub Actions to Vercel',
    excerpt:
      'Automate your delivery pipeline for quality and speed using GitHub Actions, checks, and deploy previews.',
    categories: ['technology'],
    tags: ['ci', 'cd', 'vercel', 'github-actions'],
  },
  {
    title: 'Testing Modern Web Apps: Jest, Playwright, and Contract Tests',
    excerpt:
      'A pragmatic testing strategy: unit with Jest, E2E with Playwright, and consumer-driven contract tests.',
    categories: ['programming'],
    tags: ['testing', 'jest', 'playwright', 'contracts'],
  },
];

async function ensureAuthorUser() {
  const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (firstUser) return firstUser;

  const hashedPassword = await bcrypt.hash('seed@12345', 12);
  return prisma.user.create({
    data: {
      username: 'seed-author',
      email: 'author@example.com',
      fullName: 'Seed Author',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      bio: 'Author created by seed script.',
    },
  });
}

async function upsertCategory(slug) {
  const name = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { slug, name },
  });
}

async function upsertTag(slug) {
  const name = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  return prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { slug, name },
  });
}

async function uniqueSlug(base) {
  let candidate = base;
  let i = 1;
  // Loop until a unique slug found
  /* eslint-disable no-await-in-loop */
  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

function buildContent(title, tags) {
  return `# ${title}

Building modern web applications requires a careful balance between developer experience and production reliability. In this article, we explore practical patterns that scale.

## Key Takeaways

- Use simple, composable building blocks
- Measure before optimizing
- Prefer progressive enhancement
- Embrace automation and guardrails

## Example

\`\`\`javascript
export function greet(name) {
  return \`Hello, ${'${name}'}!\`;
}

console.log(greet('world'))
\`\`\`

## Further Reading

${tags.map((t) => `- Related: ${t}`).join('\n')}

---

Thanks for reading!`;
}

async function seed() {
  console.log('📝 Seeding 10 blog posts...');
  try {
    await prisma.$connect();

    const author = await ensureAuthorUser();
    console.log(`👤 Using author: ${author.fullName} <${author.email}>`);

    let created = 0;
    for (let idx = 0; idx < POSTS.length; idx += 1) {
      const p = POSTS[idx];
      const baseSlug = slugify(p.title);
      const slug = await uniqueSlug(baseSlug);
      const content = buildContent(p.title, p.tags);
      const readTime = estimateReadTime(content);
      const featured = idx < 2; // first two featured
      const viewCount = 200 + Math.floor(Math.random() * 5000);
      const publishedAt = nowMinusDays(POSTS.length - idx);

      const createdPost = await prisma.post.create({
        data: {
          title: p.title,
          slug,
          excerpt: p.excerpt,
          content,
          published: true,
          featured,
          viewCount,
          readTime,
          authorId: author.id,
          publishedAt,
          seoTitle: p.title,
          seoDescription: p.excerpt,
        },
      });

      // Categories
      for (const c of p.categories) {
        const category = await upsertCategory(slugify(c));
        await prisma.postCategory.create({
          data: { postId: createdPost.id, categoryId: category.id },
        });
      }

      // Tags
      for (const t of p.tags) {
        const tag = await upsertTag(slugify(t));
        await prisma.postTag.create({ data: { postId: createdPost.id, tagId: tag.id } });
      }

      created += 1;
      console.log(`✓ Created: ${createdPost.title} (${createdPost.slug})`);
    }

    console.log(`\n✅ Done. Created ${created} posts.`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});


