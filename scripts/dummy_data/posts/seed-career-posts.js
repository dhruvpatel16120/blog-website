#!/usr/bin/env node

/*
  Seeds 3 real-world Career & Learning posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Career & Learning' category (slug: career-learning)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Tech Interview Preparation: Algorithms, System Design, and Behavioral Questions',
    excerpt: 'Ace your tech interviews with comprehensive preparation strategies for coding challenges, system design, and behavioral questions.',
    tags: ['interviews', 'algorithms', 'system-design', 'career-prep']
  },
  {
    title: 'Learning New Technologies: Effective Study Methods and Project-Based Learning',
    excerpt: 'Master new programming languages and frameworks with proven learning strategies and hands-on project development.',
    tags: ['learning', 'study-methods', 'project-based-learning', 'skill-development']
  },
  {
    title: 'Developer Career Growth: From Junior to Senior and Beyond',
    excerpt: 'Navigate your developer career path with strategies for skill development, mentorship, and advancing to senior positions.',
    tags: ['career-growth', 'senior-developer', 'mentorship', 'skill-development']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Career advice and learning strategies for tech professionals.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Continuous learning and career development are essential in the fast-paced tech industry.

## Learning Strategies
- Set clear learning goals
- Use spaced repetition techniques
- Build projects to apply knowledge
- Join study groups and communities

## Career Development
- Identify your strengths and interests
- Seek mentorship and guidance
- Build a strong professional network
- Continuously update your skills

## Example
\`\`\`typescript
// Learning roadmap structure
interface LearningPath {
  technology: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  projects: string[];
  resources: string[];
}

const reactPath: LearningPath = {
  technology: 'React',
  difficulty: 'intermediate',
  timeEstimate: '3-6 months',
  projects: ['Todo App', 'E-commerce Site', 'Social Media Clone'],
  resources: ['React Docs', 'Online Courses', 'Community Forums']
};
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Career & Learning Posts Seeding Script');
    utils.log('Creating realistic career & learning posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Career & Learning',
      slug: 'career-learning',
      description: 'Career advice, learning resources, and professional development',
      color: '#7C2D12',
      icon: '📚'
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
          viewCount: 500 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} Career & Learning posts successfully!`, 'green');
    
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
