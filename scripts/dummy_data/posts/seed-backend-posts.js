#!/usr/bin/env node

/*
  Seeds 5 real-world Backend Development posts with categories and tags.
  - Ensures 'Backend Development' category (slug: backend-development)
  - Upserts tags and creates posts with SEO metadata
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function nowMinusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function cover(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`;
}

const POSTS = [
  {
    title: 'Node.js in 2025: Workers, Streaming, and Edge APIs',
    excerpt: 'Modern backend patterns with Node: workers, streaming responses, and edge-friendly APIs.',
    tags: ['nodejs', 'edge-computing', 'streaming', 'workers']
  },
  {
    title: 'Designing Robust REST APIs: Versioning, Caching, and Pagination',
    excerpt: 'Practical REST design: resource modeling, versioning strategies, ETags, and cursor-based pagination.',
    tags: ['rest-api', 'http', 'caching', 'pagination']
  },
  {
    title: 'Prisma Deep Dive: Transactions, Performance, and Migrations',
    excerpt: 'Tuning Prisma in production: long transactions, connection pools, and safe migrations.',
    tags: ['prisma', 'postgres', 'database', 'migrations']
  },
  {
    title: 'Event-Driven Architectures: Queues, Topics, and Idempotency',
    excerpt: 'Build resilient systems with message brokers, retries, and idempotency keys.',
    tags: ['architecture', 'kafka', 'rabbitmq', 'idempotency']
  },
  {
    title: 'Authentication Patterns: Sessions, JWT, and Rotating Refresh Tokens',
    excerpt: 'Choose the right auth pattern and rotate tokens safely with revocation lists.',
    tags: ['authentication', 'jwt', 'sessions', 'security']
  }
];

async function ensureAuthorUser() {
  const first = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (first) return first;
  const hashed = await bcrypt.hash('seed@12345', 12);
  return prisma.user.create({
    data: {
      username: 'seed-author',
      email: 'author@example.com',
      fullName: 'Seed Author',
      password: hashed,
      role: 'USER',
      isActive: true
    }
  });
}

async function upsertCategory(slug) {
  const name = slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
  return prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } });
}

async function upsertTag(slug) {
  const name = slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
  return prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } });
}

async function uniqueSlug(base) {
  let candidate = base, i = 1;
  /* eslint-disable no-await-in-loop */
  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    i += 1; candidate = `${base}-${i}`;
  }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

function contentFor(title, tags) {
  return `# ${title}

> Practical backend guidance for production systems.

![Cover](${cover(title)})

## Overview
Reliable backends value correctness, observability, and graceful degradation.

## Key Patterns
- Health checks and readiness
- Backpressure and timeouts
- Retry with jitter

## Example
\`\`\`ts
export async function handler(req: Request) {
  return new Response('ok');
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

function keywordsFrom(title, tags) {
  const base = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  return Array.from(new Set([...base, ...tags.map((t) => t.toLowerCase())])).slice(0, 15);
}

async function seed() {
  console.log('📝 Seeding 5 Backend Development posts...');
  try {
    await prisma.$connect();
    const author = await ensureAuthorUser();
    const category = await upsertCategory('backend-development');

    let count = 0;
    for (let i = 0; i < POSTS.length; i += 1) {
      const p = POSTS[i];
      const base = slugify(p.title);
      const slug = await uniqueSlug(base);
      const content = contentFor(p.title, p.tags);
      const readTime = estimateReadTime(content);
      const publishedAt = nowMinusDays(POSTS.length - i);
      const coverImage = cover(slug);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      const metaKeywords = keywordsFrom(p.title, p.tags).join(', ');

      const created = await prisma.post.create({
        data: {
          title: p.title,
          slug,
          excerpt: p.excerpt,
          content,
          coverImage,
          published: true,
          featured: i === 0,
          viewCount: 300 + Math.floor(Math.random() * 5000),
          readTime,
          wordCount,
          charCount,
          authorId: author.id,
          publishedAt,
          seoTitle: p.title,
          seoDescription: p.excerpt,
          seoImage: coverImage,
          metaKeywords
        }
      });

      await prisma.postCategory.create({ data: { postId: created.id, categoryId: category.id } });
      for (const t of p.tags) {
        const tag = await upsertTag(slugify(t));
        await prisma.postTag.create({ data: { postId: created.id, tagId: tag.id } });
      }

      count += 1;
      console.log(`✓ Created: ${created.title} (${created.slug})`);
    }
    console.log(`\n✅ Done. Created ${count} Backend Development posts.`);
  } catch (e) {
    console.error('❌ Seed error:', e?.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });


