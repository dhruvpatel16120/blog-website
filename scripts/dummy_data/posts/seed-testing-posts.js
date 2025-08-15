#!/usr/bin/env node

/*
  Seeds 3 real-world Testing & Quality posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Testing & Quality' category (slug: testing-quality)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Test-Driven Development in Practice: Red, Green, Refactor',
    excerpt: 'Master TDD with real examples: writing tests first, making them pass, and refactoring for clean code.',
    tags: ['tdd', 'testing', 'refactoring', 'clean-code']
  },
  {
    title: 'End-to-End Testing with Playwright: Reliable UI Automation',
    excerpt: 'Build robust E2E tests with Playwright: cross-browser testing, visual regression, and CI/CD integration.',
    tags: ['e2e-testing', 'playwright', 'automation', 'ci-cd']
  },
  {
    title: 'Code Quality Tools: ESLint, Prettier, and SonarQube Setup',
    excerpt: 'Establish code quality standards with automated tools, custom rules, and team-wide enforcement.',
    tags: ['code-quality', 'eslint', 'prettier', 'sonarqube']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Practical testing and quality guidance for modern teams.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Quality software requires comprehensive testing strategies and automated quality checks.

## Testing Pyramid
- Unit tests (70%): Fast, focused, reliable
- Integration tests (20%): Service boundaries, APIs
- E2E tests (10%): User workflows, critical paths

## Best Practices
- Write tests before code (TDD)
- Keep tests fast and focused
- Use meaningful test names
- Maintain test data separately

## Example
\`\`\`typescript
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const result = await userService.create(userData);
    expect(result.id).toBeDefined();
    expect(result.name).toBe(userData.name);
  });
});
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Testing & Quality Posts Seeding Script');
    utils.log('Creating realistic testing & quality posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Testing & Quality',
      slug: 'testing-quality',
      description: 'Unit testing, integration testing, and code quality practices',
      color: '#059669',
      icon: '🧪'
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
          viewCount: 350 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} Testing & Quality posts successfully!`, 'green');
    
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
