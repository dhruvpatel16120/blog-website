#!/usr/bin/env node

/*
  Seeds 5 real-world Backend Development posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Backend Development' category (slug: backend-development)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

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
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Backend Development Posts Seeding Script');
    utils.log('Creating realistic backend development posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Backend Development',
      slug: 'backend-development',
      description: 'Server-side development, APIs, and backend architecture',
      color: '#10B981',
      icon: '🔧'
    });

    let count = 0;
    for (let i = 0; i < POSTS.length; i += 1) {
      const p = POSTS[i];
      const base = utils.slugify(p.title);
      const slug = await utils.generateUniqueSlug(base, 'post');
      const content = contentFor(p.title, p.tags);
      const readTime = utils.estimateReadTime(content);
      const publishedAt = utils.daysAgo(POSTS.length - i);
      const coverImage = utils.generateCoverImage(slug);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      const metaKeywords = utils.generateKeywords(p.title, p.tags);

      const created = await utils.prisma.post.create({
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

      await utils.prisma.postCategory.create({ data: { postId: created.id, categoryId: category.id } });
      for (const t of p.tags) {
        const tag = await utils.upsertTag({
          name: t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: utils.slugify(t),
          color: '#6B7280'
        });
        await utils.prisma.postTag.create({ data: { postId: created.id, tagId: tag.id } });
      }

      count += 1;
      utils.logSuccess(`Created: ${created.title} (${created.slug})`);
    }
    
    utils.logSection('✅ Seeding Complete');
    utils.log(`Created ${count} Backend Development posts successfully!`, 'green');
    
  } catch (e) {
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });


