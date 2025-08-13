#!/usr/bin/env node

/*
  Seeds 5 real-world Mobile Development posts with categories and tags.
  - Ensures 'Mobile Development' category (slug: mobile-development)
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function slugify(title) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function estimateReadTime(content) { const words = content.split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 220)); }
function nowMinusDays(days) { const d = new Date(); d.setDate(d.getDate() - days); return d; }
function cover(seed) { return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`; }

const POSTS = [
  { title: 'React Native in 2025: New Architecture, Fabric, and TurboModules', excerpt: 'Ship faster with RN new architecture, Fabric renderer, and TurboModules.', tags: ['react-native', 'fabric', 'turbo-modules', 'bridgeless'] },
  { title: 'Flutter Best Practices: State, Navigation, and Animations', excerpt: 'Patterns for robust Flutter apps: state management, routing, and smooth animations.', tags: ['flutter', 'state', 'navigation', 'animations'] },
  { title: 'Mobile CI/CD: Fastlane, EAS, and Release Automation', excerpt: 'Automate builds and releases with Fastlane, EAS, and code signing strategies.', tags: ['cicd', 'fastlane', 'expo', 'release'] },
  { title: 'Offline-first Mobile Apps: Caching, Sync, and Conflict Resolution', excerpt: 'Design offline-first: local caches, background sync, and conflict resolution patterns.', tags: ['offline', 'sync', 'graphql', 'sqlite'] },
  { title: 'Performance on Mobile: Jank-Free Lists, Images, and Profiling', excerpt: 'Reduce jank: virtualized lists, responsive images, and profiling tools.', tags: ['performance', 'profiling', 'react-native', 'flutter'] },
];

async function ensureAuthorUser() {
  const first = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (first) return first;
  const hashed = await bcrypt.hash('seed@12345', 12);
  return prisma.user.create({ data: { username: 'seed-author', email: 'author@example.com', fullName: 'Seed Author', password: hashed, role: 'USER', isActive: true } });
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
  while (await prisma.post.findUnique({ where: { slug: candidate } })) { i += 1; candidate = `${base}-${i}`; }
  /* eslint-enable no-await-in-loop */
  return candidate;
}

function contentFor(title, tags) {
  return `# ${title}

> Practical mobile patterns for resilient apps.

![Cover](${cover(title)})

## Overview
Mobile apps need to handle unreliable networks, background execution, and constrained resources.

## Example
\`\`\`tsx
export function Title({ children }: { children: React.ReactNode }) {
  return <Text accessibilityRole="header">{children}</Text>
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
  console.log('📝 Seeding 5 Mobile Development posts...');
  try {
    await prisma.$connect();
    const author = await ensureAuthorUser();
    const category = await upsertCategory('mobile-development');

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
          viewCount: 250 + Math.floor(Math.random() * 4000),
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
    console.log(`\n✅ Done. Created ${count} Mobile Development posts.`);
  } catch (e) {
    console.error('❌ Seed error:', e?.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });


