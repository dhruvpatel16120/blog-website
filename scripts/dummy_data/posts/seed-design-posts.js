#!/usr/bin/env node

/*
  Seeds 3 real-world UI/UX Design posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'UI/UX Design' category (slug: ui-ux-design)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Design Systems: Building Scalable Component Libraries',
    excerpt: 'Create maintainable design systems with consistent components, design tokens, and documentation.',
    tags: ['design-systems', 'components', 'design-tokens', 'scalability']
  },
  {
    title: 'Accessibility First: WCAG Guidelines and Inclusive Design',
    excerpt: 'Design for everyone with WCAG compliance, screen reader support, and inclusive design principles.',
    tags: ['accessibility', 'wcag', 'inclusive-design', 'a11y']
  },
  {
    title: 'User Research Methods: Interviews, Surveys, and Usability Testing',
    excerpt: 'Validate your designs with user research: conducting interviews, surveys, and usability testing.',
    tags: ['user-research', 'usability-testing', 'interviews', 'surveys']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Design principles for creating intuitive and accessible user interfaces.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Good design is invisible - users should focus on their goals, not the interface.

## Design Principles
- Consistency across all touchpoints
- Clear visual hierarchy
- Progressive disclosure
- Error prevention and recovery

## Accessibility Checklist
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus management

## Example
\`\`\`css
/* Design tokens for consistency */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --spacing-unit: 0.25rem;
  --border-radius: 0.375rem;
}

.button {
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 4);
  border-radius: var(--border-radius);
  background-color: var(--color-primary);
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 UI/UX Design Posts Seeding Script');
    utils.log('Creating realistic UI/UX design posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
      description: 'User interface design, user experience, and design systems',
      color: '#BE185D',
      icon: '🎨'
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
          viewCount: 250 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} UI/UX Design posts successfully!`, 'green');
    
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
