#!/usr/bin/env node

/* Seeds 2 Database & Data posts (slug: database-data) */
const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  { title: 'PostgreSQL Performance: Indexing, EXPLAIN, and VACUUM', excerpt: 'Tune Postgres: indexing strategies, query plans, and autovacuum tuning.', tags: ['postgres', 'indexing', 'explain', 'vacuum'] },
  { title: 'Caching Patterns with Redis: TTLs, Streams, and Lua Scripts', excerpt: 'Go beyond simple GET/SET with queues, streams, and atomic Lua operations.', tags: ['redis', 'caching', 'streams'] },
];

function content(title, tags) { 
  return `# ${title}\n\n> Practical database tuning and data engineering.\n\n![Cover](${SeedingUtils.prototype.generateCoverImage(title)})\n\n- Observability with pg_stat_*\n- Query plans and JIT\n\nRelated:\n${tags.map((t) => `- ${t}`).join('\n')}`; 
}

async function main() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 Database & Data Posts Seeding Script');
    utils.log('Creating realistic database & data posts for your blog...', 'white');

    await utils.connect();
    const a = await utils.ensureAuthorUser();
    const cat = await utils.upsertCategory({
      name: 'Database & Data',
      slug: 'database-data',
      description: 'SQL, NoSQL, data modeling, and database optimization',
      color: '#059669',
      icon: '🗄️'
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
          viewCount: 250 + Math.floor(Math.random()*3000), 
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
    utils.log(`Created ${count} Database & Data posts successfully!`, 'green');
    
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


