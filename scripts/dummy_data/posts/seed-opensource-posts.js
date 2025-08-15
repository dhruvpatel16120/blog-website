#!/usr/bin/env node

/*
  Seeds 2 real-world Open Source posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Open Source' category (slug: open-source)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Contributing to Open Source: First Steps and Best Practices',
    excerpt: 'Start your open source journey with practical tips for finding projects, making contributions, and building your reputation.',
    tags: ['open-source', 'contributing', 'github', 'community']
  },
  {
    title: 'Maintaining Open Source Projects: Documentation, CI/CD, and Community Management',
    excerpt: 'Learn how to maintain successful open source projects with proper documentation, automated testing, and community engagement.',
    tags: ['open-source', 'maintenance', 'documentation', 'community-management']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Building and contributing to open source software.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Open source software powers the modern web and provides opportunities for learning and collaboration.

## Getting Started
- Find projects that interest you
- Read contribution guidelines
- Start with small issues (good first issue)
- Join community discussions

## Best Practices
- Write clear commit messages
- Follow project coding standards
- Test your changes thoroughly
- Be respectful in discussions

## Example
\`\`\`bash
# Fork and clone a repository
git clone https://github.com/yourusername/project-name.git
cd project-name

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create a pull request
git push origin feature/your-feature-name
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Open Source Posts Seeding Script');
    utils.log('Creating realistic open source posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Open Source',
      slug: 'open-source',
      description: 'Contributing to open source, community projects, and collaboration',
      color: '#059669',
      icon: '📖'
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
          viewCount: 200 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} Open Source posts successfully!`, 'green');
    
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
