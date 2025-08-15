#!/usr/bin/env node

/*
  Seeds 3 real-world Performance & Optimization posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Performance & Optimization' category (slug: performance-optimization)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Frontend Performance: Bundle Analysis, Code Splitting, and Lazy Loading',
    excerpt: 'Optimize your frontend with webpack bundle analysis, dynamic imports, and intelligent code splitting strategies.',
    tags: ['performance', 'webpack', 'code-splitting', 'lazy-loading']
  },
  {
    title: 'Database Query Optimization: Indexing Strategies and Query Plans',
    excerpt: 'Speed up your database with proper indexing, query optimization, and execution plan analysis.',
    tags: ['database', 'indexing', 'query-optimization', 'performance']
  },
  {
    title: 'Caching Strategies: Redis, CDN, and Application-Level Caching',
    excerpt: 'Implement multi-layer caching with Redis, CDN optimization, and application-level cache invalidation.',
    tags: ['caching', 'redis', 'cdn', 'cache-invalidation']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Performance optimization techniques for modern applications.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Performance optimization is crucial for user experience and business metrics.

## Key Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

## Optimization Strategies
- Measure first, optimize second
- Focus on critical rendering path
- Implement progressive enhancement
- Use performance budgets

## Example
\`\`\`typescript
// Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Use React.memo for expensive renders
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{expensiveCalculation(data)}</div>;
});
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Performance & Optimization Posts Seeding Script');
    utils.log('Creating realistic performance & optimization posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Performance & Optimization',
      slug: 'performance-optimization',
      description: 'Speed optimization, caching strategies, and performance monitoring',
      color: '#D97706',
      icon: '⚡'
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
          viewCount: 300 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} Performance & Optimization posts successfully!`, 'green');
    
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
