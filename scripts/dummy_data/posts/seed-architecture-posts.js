#!/usr/bin/env node

/*
  Seeds 3 real-world Software Architecture posts with categories and tags.
  Uses the new SeedingUtils for consistent error handling and logging.
  - Ensures 'Software Architecture' category (slug: software-architecture)
  - Upserts tags and creates posts with SEO metadata
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  {
    title: 'Microservices at Scale: Service Mesh, Circuit Breakers, and Distributed Tracing',
    excerpt: 'Design resilient microservices with Istio, circuit breakers, and comprehensive observability patterns.',
    tags: ['microservices', 'service-mesh', 'istio', 'distributed-systems']
  },
  {
    title: 'Event-Driven Architecture: CQRS, Event Sourcing, and Saga Patterns',
    excerpt: 'Build scalable systems with event sourcing, CQRS, and saga orchestration for complex workflows.',
    tags: ['event-sourcing', 'cqrs', 'saga', 'domain-events']
  },
  {
    title: 'System Design Interviews: Design Twitter, Uber, and Netflix',
    excerpt: 'Master system design interviews with step-by-step approaches to designing large-scale distributed systems.',
    tags: ['system-design', 'distributed-systems', 'scalability', 'interviews']
  }
];

function contentFor(title, tags) {
  return `# ${title}

> Practical architectural guidance for production systems.

![Cover](${SeedingUtils.prototype.generateCoverImage(title)})

## Overview
Modern software architecture requires careful consideration of scalability, reliability, and maintainability.

## Key Principles
- Separation of concerns
- Loose coupling, high cohesion
- Fail fast and gracefully
- Design for observability

## Architecture Patterns
- Layered architecture
- Hexagonal architecture
- Event-driven architecture
- Microservices patterns

## Implementation
\`\`\`typescript
interface ArchitecturePattern {
  name: string;
  benefits: string[];
  tradeoffs: string[];
  useCases: string[];
}
\`\`\`

## Resources
${tags.map((t) => `- Related: ${t}`).join('\n')}
`;
}

async function seed() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Software Architecture Posts Seeding Script');
    utils.log('Creating realistic software architecture posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const category = await utils.upsertCategory({
      name: 'Software Architecture',
      slug: 'software-architecture',
      description: 'System design, microservices, and architectural patterns',
      color: '#1F2937',
      icon: '🏗️'
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
          viewCount: 400 + Math.floor(Math.random() * 3000),
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
    utils.log(`Created ${count} Software Architecture posts successfully!`, 'green');
    
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
