#!/usr/bin/env node

/* Seeds 2 Data Science & AI posts (slug: data-science-ai) */
const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  { title: 'Practical ML in Production: Feature Stores and Monitoring', excerpt: 'Ship ML with confidence: feature stores, drift detection, and observability.', tags: ['ml', 'feature-store', 'monitoring'] },
  { title: 'Vector Databases 101: Embeddings, Recall, and Latency', excerpt: 'Choose and tune vector DBs: embeddings, HNSW, recall/latency trade-offs.', tags: ['vector-db', 'embeddings', 'retrieval'] },
];

function content(title, tags) { 
  return `# ${title}\n\n> Practical DS/AI for product teams.\n\n![Cover](${SeedingUtils.prototype.generateCoverImage(title)})\n\n- Data contracts\n- Offline/online validation\n\nRelated:\n${tags.map((t) => `- ${t}`).join('\n')}`; 
}

async function main() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Data Science & AI Posts Seeding Script');
    utils.log('Creating realistic data science & AI posts for your blog...', 'white');

    await utils.connect();
    const a = await utils.ensureAuthorUser();
    const cat = await utils.upsertCategory({
      name: 'Data Science & AI',
      slug: 'data-science-ai',
      description: 'Machine learning, artificial intelligence, and data analytics',
      color: '#EC4899',
      icon: '🤖'
    });
    
    let count = 0;
    for (let i = 0; i < POSTS.length; i += 1) {
      const p = POSTS[i];
      const slug = await utils.generateUniqueSlug(utils.slugify(p.title), 'post');
      const body = content(p.title, p.tags);
      const created = await utils.prisma.post.create({ 
        data: {
          title: p.title, 
          slug, 
          excerpt: p.excerpt, 
          content: body, 
          coverImage: utils.generateCoverImage(slug), 
          published: true, 
          featured: i === 0, 
          viewCount: 200 + Math.floor(Math.random()*3000), 
          readTime: utils.estimateReadTime(body), 
          wordCount: body.split(/\s+/).filter(Boolean).length, 
          charCount: body.length, 
          authorId: a.id, 
          publishedAt: utils.daysAgo(POSTS.length - i), 
          seoTitle: p.title, 
          seoDescription: p.excerpt, 
          seoImage: utils.generateCoverImage(slug), 
          metaKeywords: utils.generateKeywords(p.title, p.tags)
        } 
      });
      
      await utils.prisma.postCategory.create({ data: { postId: created.id, categoryId: cat.id } });
      for (const t of p.tags) { 
        const tg = await utils.upsertTag({
          name: t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: utils.slugify(t),
          color: '#6B7280'
        }); 
        await utils.prisma.postTag.create({ data: { postId: created.id, tagId: tg.id } }); 
      }
      
      count += 1; 
      utils.logSuccess(`Created ${created.slug}`);
    }
    
    utils.logSection('✅ Seeding Complete');
    utils.log(`Created ${count} Data Science & AI posts successfully!`, 'green');
    
  } catch (e) { 
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});


