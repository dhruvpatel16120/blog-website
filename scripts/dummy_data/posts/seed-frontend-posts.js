#!/usr/bin/env node

/*
  Seeds 5 real-world Frontend Development posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Frontend Development' category (slug: frontend-development)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');
const bcrypt = require('bcryptjs');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
    title: 'React 19 in Production: Actions, Server Components, and Forms',
    excerpt:
      'A pragmatic guide to shipping React 19 today: server components, actions, and progressive enhancement for forms.',
    tags: ['react', 'react-19', 'rsc', 'forms', 'progressive-enhancement']
  },
  {
    title: 'Designing Component APIs: Props, Slots, and Headless Patterns',
    excerpt:
      'Build components your team loves using composable APIs, headless patterns, and clear state ownership.',
    tags: ['design-systems', 'headless-ui', 'typescript', 'props']
  },
  {
    title: 'State Management in 2025: React Query, Zustand, and Context',
    excerpt:
      'Choose the right tools for the job: server cache vs. client state, and avoiding prop‑drilling.',
    tags: ['state-management', 'react-query', 'zustand', 'context']
  },
  {
    title: 'Accessible Forms: Labels, Errors, and Keyboard UX That Scale',
    excerpt:
      'Stop bolting on a11y at the end—bake it into your design system with patterns that scale.',
    tags: ['a11y', 'aria', 'forms', 'testing']
  },
  {
    title: 'Tailwind at Scale: Tokens, Theming, and Component Primitives',
    excerpt:
      'From utility classes to a maintainable design system: tokens, theming, and UI primitives with Tailwind.',
    tags: ['tailwind-css', 'design-tokens', 'theming', 'ui-components']
  }
];

async function ensureAuthorUser() {
  const firstUser = await SeedingUtils.prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (firstUser) return firstUser;

  const hashedPassword = await bcrypt.hash('seed@12345', 12);
  return SeedingUtils.prisma.user.create({
    data: {
      username: 'seed-author',
      email: 'author@example.com',
      fullName: 'Seed Author',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      bio: 'Author created by Frontend seed script.'
    }
  });
}

async function upsertCategory(slug) {
  const name = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  return SeedingUtils.prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } });
}

async function upsertTag(slug) {
  const name = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  return SeedingUtils.prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } });
}

async function uniqueSlug(base) {
  let candidate = base;
  let i = 1;
  /* eslint-disable no-await-in-loop */
  while (await SeedingUtils.prisma.post.findUnique({ where: { slug: candidate } })) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

function buildContent(title, tags) {
  const steps = [
    'Overview',
    'Key Ideas',
    'Code Examples',
    'Patterns',
    'Testing',
    'Resources'
  ];
  return `# ${title}

> Practical guidance for modern frontend teams.

![Cover image](${cover(title)})

## Table of contents
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Overview
This article focuses on pragmatic patterns that make UIs resilient and maintainable.

## Key Ideas
- Favor server‑driven data to keep clients lean
- Compose components via slots/headless patterns
- Make a11y a first‑class concern

## Code Examples
\`\`\`tsx
export function Greeting({ name }: { name: string }) {
  return <p className="text-sm">Hello, {name}!</p>
}
\`\`\`

## Patterns
- Progressive enhancement for forms
- Component primitives over ad‑hoc utilities

## Testing
- RTL for units, Playwright for E2E

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
    utils.logHeader('📝 Frontend Development Posts Seeding Script');
    utils.log('Creating realistic frontend development posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Frontend Development',
      slug: 'frontend-development',
      description: 'React, Vue, Angular, and modern frontend technologies',
      color: '#8B5CF6',
      icon: '⚛️'
    });

    let count = 0;
    for (let i = 0; i < POSTS.length; i += 1) {
      const p = POSTS[i];
      const base = utils.slugify(p.title);
      const slug = await utils.generateUniqueSlug(base, 'post');
      const content = buildContent(p.title, p.tags);
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
          viewCount: 200 + Math.floor(Math.random() * 4000),
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
    utils.log(`Created ${count} Frontend Development posts successfully!`, 'green');
    
  } catch (e) {
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});


