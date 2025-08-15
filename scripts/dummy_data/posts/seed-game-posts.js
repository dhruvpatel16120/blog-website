#!/usr/bin/env node

/*
  Seeds 3 real-world Game Development posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Game Development' category (slug: game-development)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Unity vs Unreal: Choosing the Right Engine for Your Game',
    excerpt: 'Compare Unity and Unreal Engine for 2D, 3D, and cross-platform game development in 2025.',
    tags: ['unity', 'unreal-engine', 'game-engines', 'cross-platform']
  },
  {
    title: 'Game Networking: Real-Time Multiplayer, Lag Compensation, and Matchmaking',
    excerpt: 'Build scalable multiplayer games with authoritative servers, lag compensation, and matchmaking systems.',
    tags: ['multiplayer', 'networking', 'matchmaking', 'lag-compensation']
  },
  {
    title: 'Game Art Pipelines: From Blender to In-Game Assets',
    excerpt: 'Streamline your art workflow: modeling in Blender, texturing, and importing assets into Unity/Unreal.',
    tags: ['game-art', 'blender', 'assets', 'workflow']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Practical game development guidance for modern studios and indies.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Game development blends art, code, and design for interactive experiences.

## Key Topics
- Game engine selection
- Asset pipelines
- Multiplayer architecture
- Performance optimization

## Example
\`\`\`csharp
// Unity C# example: basic movement
void Update() {
  float move = Input.GetAxis("Horizontal");
  transform.position += Vector3.right * move * Time.deltaTime;
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Game Development Posts Seeding Script');
    utils.log('Creating realistic game development posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Game Development',
      slug: 'game-development',
      description: 'Game development with Unity, Unreal Engine, and web technologies',
      color: '#8B5CF6',
      icon: '🎮'
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
    utils.log(`Created ${count} Game Development posts successfully!`, 'green');
    
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
