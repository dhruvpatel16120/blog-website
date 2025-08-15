#!/usr/bin/env node

/*
  Seeds 5 real-world Mobile Development posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Mobile Development' category (slug: mobile-development)
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  { title: 'React Native in 2025: New Architecture, Fabric, and TurboModules', excerpt: 'Ship faster with RN new architecture, Fabric renderer, and TurboModules.', tags: ['react-native', 'fabric', 'turbo-modules', 'bridgeless'] },
  { title: 'Flutter Best Practices: State, Navigation, and Animations', excerpt: 'Patterns for robust Flutter apps: state management, routing, and smooth animations.', tags: ['flutter', 'state', 'navigation', 'animations'] },
  { title: 'Mobile CI/CD: Fastlane, EAS, and Release Automation', excerpt: 'Automate builds and releases with Fastlane, EAS, and code signing strategies.', tags: ['cicd', 'fastlane', 'expo', 'release'] },
  { title: 'Offline-first Mobile Apps: Caching, Sync, and Conflict Resolution', excerpt: 'Design offline-first: local caches, background sync, and conflict resolution patterns.', tags: ['offline', 'sync', 'graphql', 'sqlite'] },
  { title: 'Performance on Mobile: Jank-Free Lists, Images, and Profiling', excerpt: 'Reduce jank: virtualized lists, responsive images, and profiling tools.', tags: ['performance', 'profiling', 'react-native', 'flutter'] },
];

function slugify(title) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function estimateReadTime(content) { const words = content.split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 220)); }
function nowMinusDays(days) { const d = new Date(); d.setDate(d.getDate() - days); return d; }
function cover(seed) { return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`; }

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
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Mobile Development Posts Seeding Script');
    utils.log('Creating realistic mobile development posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'iOS, Android, React Native, and mobile app development',
      color: '#F59E0B',
      icon: '📱'
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
    utils.log(`Created ${count} Mobile Development posts successfully!`, 'green');
    
  } catch (e) {
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });


