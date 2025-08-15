#!/usr/bin/env node

/*
  Seeds 10 real-world Web Development posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Uses the first existing user as author, or creates a seed author if none exists
  - Ensures the 'Web Development' category exists
  - Upserts tags as needed (creates missing ones)
  - Generates unique slugs
  - Sets published, readTime, viewCount, featured flags

  Usage:
    node scripts/dummy_data/posts/seed-webdev-posts.js
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'The 2025 Web Performance Checklist: Core Web Vitals, HTTP/3, and Edge',
    excerpt:
      'Practical steps to ship fast websites in 2025: Core Web Vitals, image strategy, HTTP/3, edge rendering, and monitoring.',
    categories: ['web-development'],
    tags: ['performance', 'lighthouse', 'cdn', 'vercel', 'nextjs']
  },
  {
    title: 'Modern SSR in Next.js 15: RSC, Streaming, and Partial Hydration',
    excerpt:
      'Deep dive into Next.js 15 server components, streaming UI, and how to balance server and client work for snappy UX.',
    categories: ['web-development'],
    tags: ['nextjs', 'react', 'typescript', 'caching', 'edge-computing']
  },
  {
    title: 'Building Accessible React Apps: ARIA Patterns, Headless UI, and Testing',
    excerpt:
      'Make accessibility a feature, not an afterthought: roles, ARIA patterns, keyboard UX, and test coverage with Testing Library.',
    categories: ['web-development'],
    tags: ['react', 'testing', 'jest', 'playwright', 'accessibility']
  },
  {
    title: 'CSS Architecture in 2025: Design Tokens, Utility-First, and CSS Nesting',
    excerpt:
      'From design tokens to Tailwind and native nesting—establish a maintainable CSS architecture that scales with your team.',
    categories: ['web-development'],
    tags: ['css', 'tailwind-css', 'design-patterns', 'performance']
  },
  {
    title: 'API-first Frontends with Next.js: REST, GraphQL, and tRPC Compared',
    excerpt:
      'Choosing the right API layer for your frontend: trade-offs of REST, GraphQL, and tRPC with real examples in Next.js.',
    categories: ['web-development'],
    tags: ['rest-api', 'graphql', 'nodejs', 'nextjs']
  },
  // Added posts
  {
    title: 'Progressive Images in Next.js: AVIF, Blur-up, and Responsive Strategy',
    excerpt:
      'End-to-end image strategy in Next.js: picking formats, responsive sizes, CDN delivery, and blur-up placeholders.',
    categories: ['web-development'],
    tags: ['nextjs', 'image-optimization', 'performance', 'cdn']
  },
  {
    title: 'App Router Routing Patterns: Dynamic Segments, Interception, and Sitemaps',
    excerpt:
      'Master App Router patterns: parallel routes, dynamic segments, interception, and generating sitemaps/robots at build time.',
    categories: ['web-development'],
    tags: ['nextjs', 'typescript', 'nodejs']
  },
  {
    title: 'Testing React at Scale: RTL Patterns, MSW, and Playwright E2E',
    excerpt:
      'A stable testing stack that scales: unit tests with RTL, API mocks with MSW, and resilient E2E with Playwright.',
    categories: ['web-development'],
    tags: ['react', 'testing', 'jest', 'playwright']
  },
  {
    title: 'Advanced Tailwind Workflows: Tokens, Theming, and Dark Mode',
    excerpt:
      'Move beyond utility classes: design tokens, theme management, dark mode, and component composition patterns.',
    categories: ['web-development'],
    tags: ['tailwind-css', 'css', 'design-patterns']
  },
  {
    title: 'Caching at the Edge: SWR, Stale-While-Revalidate, and Streaming APIs',
    excerpt:
      'Serve fast without sacrificing freshness: SWR, edge caching, and streaming responses with practical Node examples.',
    categories: ['web-development'],
    tags: ['edge-computing', 'caching', 'rest-api', 'nodejs']
  }
];

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

function getCoverImage(seed) {
  // Deterministic CDN image per post
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`;
}

function buildContent(title, tags) {
  const toc = [
    'Overview',
    'Architecture',
    'Step-by-step Guide',
    'Code Examples',
    'Performance Checklist',
    'Common Pitfalls',
    'Resources'
  ];

  return `# ${title}
 
 > A practical, production-focused guide for modern web development.
 
 ![Cover image](${getCoverImage(title)})
 
 ## Table of contents
 ${toc.map((t, i) => `${i + 1}. ${t}`).join('\n')}
 
 ## Overview
 Modern web development continues to evolve rapidly. This article focuses on practical techniques you can apply today to improve user experience and developer velocity.
 
 ## Architecture
 A clean separation between server and client responsibilities is essential. Prefer server-side work for data fetching and security, and keep the client focused on interactivity.
 
 | Concern | Where it belongs | Why |
 | --- | --- | --- |
 | Data fetching | Server | Security, caching, consistency |
 | Rendering heavy lists | Server (streaming) | Time-to-first-byte and perceived speed |
 | Auth/session | Server | Sensitive logic and tokens |
 | Animations | Client | Smooth UX and user feedback |
 
 ## Step-by-step Guide
 1. Measure current performance (Lighthouse, Web Vitals)
 2. Eliminate render-blocking resources (fonts, CSS)
 3. Stream above-the-fold content
 4. Cache data by scope (request, route, app)
 5. Defer non-critical JS
 6. Monitor and regress-test in CI
 
 ## Code Examples
 
 ### Simple greet function
 
 \`\`\`javascript
 export function greet(name) {
   return 'Hello, ' + name + '!';
 }
 
 console.log(greet('web'))
 \`\`\`
 
 ### Accessible button component
 
 \`\`\`tsx
 type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };
 
 export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
   const base = 'inline-flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
   const styles = variant === 'primary'
     ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600'
     : 'bg-transparent text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-600';
   return (
     <button className={base + ' ' + styles} {...props}>
       {children}
     </button>
   );
 }
 \`\`\`
 
 ## Performance Checklist
 - Eliminate unnecessary client-side JS
 - Prefer streaming and partial hydration
 - Use responsive images and modern formats (AVIF/WebP)
 - Defer third-party scripts and measure their impact
 - Cache aggressively where safe
 
 ## Common Pitfalls
 - Mixing server-only logic in client components
 - Overusing client state where derivable from URL or server
 - Missing dependency arrays in hooks
 
 ## Resources
 ${tags.map((t) => `- Related: ${t}`).join('\n')}
 - Web.dev guidance: https://web.dev/
 - MDN web docs: https://developer.mozilla.org/
 
 ---
 
 Thanks for reading!`;
}

function getKeywordsFrom(title, tags) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return Array.from(new Set([...base, ...tags.map((t) => t.toLowerCase())])).slice(0, 15);
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Web Development Posts Seeding Script');
    utils.log('Creating realistic web development posts for your blog...', 'white');

    // Connect to database
    utils.logSection('🔍 Database Connection');
    await utils.connect();

    const author = await utils.ensureAuthorUser();
    utils.logInfo(`Using author: ${author.fullName} <${author.email}>`);

    // Ensure Web Development category exists
    const webDevCategory = await utils.upsertCategory({
      name: 'Web Development',
      slug: 'web-development',
      description: 'Modern web development techniques, frameworks, and best practices',
      color: '#3B82F6',
      icon: '🌐'
    });

    let created = 0;
    for (let idx = 0; idx < POSTS.length; idx += 1) {
      const p = POSTS[idx];
      const baseSlug = utils.slugify(p.title);
      const slug = await utils.generateUniqueSlug(baseSlug, 'post');
      const content = buildContent(p.title, p.tags);
      const readTime = utils.estimateReadTime(content);
      const featured = idx < 1; // first one featured
      const viewCount = 200 + Math.floor(Math.random() * 5000);
      const publishedAt = utils.daysAgo(POSTS.length - idx);
      const coverImage = utils.generateCoverImage(slug);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      const metaKeywords = utils.generateKeywords(p.title, p.tags);

      const createdPost = await utils.prisma.post.create({
        data: {
          title: p.title,
          slug,
          excerpt: p.excerpt,
          content,
          coverImage,
          published: true,
          featured,
          viewCount,
          readTime,
          wordCount,
          charCount,
          authorId: author.id,
          publishedAt,
          seoTitle: p.title,
          seoDescription: p.excerpt,
          seoImage: coverImage,
          metaKeywords,
        },
      });

      // Categories (force add Web Development)
      await utils.prisma.postCategory.create({
        data: { postId: createdPost.id, categoryId: webDevCategory.id },
      });

      // Tags
      for (const t of p.tags) {
        const tag = await utils.upsertTag({
          name: t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: t,
          color: '#6B7280'
        });
        await utils.prisma.postTag.create({ data: { postId: createdPost.id, tagId: tag.id } });
      }

      created += 1;
      utils.logSuccess(`Created: ${createdPost.title} (${createdPost.slug})`);
    }

    utils.logSection('✅ Seeding Complete');
    utils.log(`Created ${created} Web Development posts successfully!`, 'green');

  } catch (err) {
    utils.logError(`Seed error: ${err.message}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
