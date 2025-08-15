#!/usr/bin/env node

/*
  Seeds 2 DevOps & Cloud posts (category slug: devops-cloud)
  Uses the new SeedingUtils for consistent error handling and logging.
*/

const SeedingUtils = require('../utils/seeding-utils');

const POSTS = [
  { title: 'Kubernetes in Production: Scaling, Probes, and Rolling Updates', excerpt: 'Operate k8s clusters with confidence: probes, resources, HPA, and rolling updates.', tags: ['kubernetes', 'scaling', 'hpa', 'sre'] },
  { title: 'IaC Done Right: Terraform Modules, Workspaces, and State', excerpt: 'Structure Terraform for teams: modules, workspaces, remote state, and drift detection.', tags: ['terraform', 'iac', 'cloud', 'devops'] },
];

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function cover(seed) { return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`; }
function readTime(text) { return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 220)); }
function dayOffset(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

async function ensureAuthor() {
  const u = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (u) return u;
  const hash = await bcrypt.hash('seed@12345', 12);
  return prisma.user.create({ data: { username: 'seed-author', email: 'author@example.com', fullName: 'Seed Author', password: hash, isActive: true } });
}

async function upsertCategory(slug) {
  const name = slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
  return prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } });
}

async function upsertTag(slug) {
  const name = slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
  return prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } });
}

async function uniqueSlug(base) {
  let s = base, i = 1;
  /* eslint-disable no-await-in-loop */
  while (await prisma.post.findUnique({ where: { slug: s } })) { i += 1; s = `${base}-${i}`; }
  /* eslint-enable no-await-in-loop */
  return s;
}

function content(title, tags) {
  return `# ${title}\n\n> Practical DevOps & Cloud guidance.\n\n![Cover](${cover(title)})\n\n- Observability and SLOs\n- Resilience by design\n\nRelated:\n${tags.map((t) => `- ${t}`).join('\n')}`;
}

async function main() {
  const utils = new SeedingUtils();
  
  try {
    utils.logHeader('📝 DevOps & Cloud Posts Seeding Script');
    utils.log('Creating realistic DevOps & Cloud posts for your blog...', 'white');

    await utils.connect();
    const author = await utils.ensureAuthorUser();
    const cat = await utils.upsertCategory({
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'CI/CD, Docker, Kubernetes, AWS, Azure, and cloud infrastructure',
      color: '#EF4444',
      icon: '☁️'
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
          viewCount: 300 + Math.floor(Math.random() * 3000),
          readTime: utils.estimateReadTime(body),
          wordCount: body.split(/\s+/).filter(Boolean).length,
          charCount: body.length,
          authorId: author.id,
          publishedAt: utils.daysAgo(POSTS.length - i),
          seoTitle: p.title,
          seoDescription: p.excerpt,
          seoImage: utils.generateCoverImage(slug),
          metaKeywords: utils.generateKeywords(p.title, p.tags)
        }
      });
      
      await utils.prisma.postCategory.create({ data: { postId: created.id, categoryId: cat.id } });
      for (const t of p.tags) {
        const tag = await utils.upsertTag({
          name: t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: utils.slugify(t),
          color: '#6B7280'
        });
        await utils.prisma.postTag.create({ data: { postId: created.id, tagId: tag.id } });
      }
      
      count += 1;
      utils.logSuccess(`Created ${created.slug}`);
    }
    
    utils.logSection('✅ Seeding Complete');
    utils.log(`Created ${count} DevOps & Cloud posts successfully!`, 'green');
    
  } catch (e) {
    utils.logError(`Seed error: ${e?.message || e}`);
    process.exit(1);
  } finally {
    await utils.disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


