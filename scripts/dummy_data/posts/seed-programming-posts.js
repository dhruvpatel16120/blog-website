#!/usr/bin/env node

/* Seeds 2 Programming Languages posts (slug: programming-languages) */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function cover(seed) { return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/900`; }
function readTime(t) { return Math.max(1, Math.ceil(t.split(/\s+/).filter(Boolean).length / 220)); }
function dayOffset(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

const POSTS = [
  { title: 'Rust for Backend Devs: Traits, Lifetimes, and Async', excerpt: 'A gentle path to Rust for backend engineers: traits, lifetimes, async.', tags: ['rust', 'async', 'traits'] },
  { title: 'Modern Python: Typing, Dataclasses, and Pydantic', excerpt: 'Write robust Python with types, dataclasses, and Pydantic models.', tags: ['python', 'typing', 'pydantic'] },
];

async function author() { const u = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }); if (u) return u; const h = await bcrypt.hash('seed@12345', 12); return prisma.user.create({ data: { username: 'seed-author', email: 'author@example.com', fullName: 'Seed Author', password: h, isActive: true } }); }
async function upsertCategory(slug) { const name = slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '); return prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } }); }
async function upsertTag(slug) { const name = slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '); return prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } }); }
async function uniqueSlug(base) { let s = base, i = 1; /* eslint-disable no-await-in-loop */ while (await prisma.post.findUnique({ where: { slug: s } })) { i += 1; s = `${base}-${i}`; } /* eslint-enable no-await-in-loop */ return s; }

function content(title, tags) { return `# ${title}\n\n> Practical language features for production.\n\n![Cover](${cover(title)})\n\n- Type systems and contracts\n- Packaging and dependency hygiene\n\nRelated:\n${tags.map((t) => `- ${t}`).join('\n')}`; }

async function main() {
  console.log('📝 Seeding Programming Languages posts...');
  await prisma.$connect();
  const a = await author();
  const cat = await upsertCategory('programming-languages');
  let count = 0;
  for (let i = 0; i < POSTS.length; i += 1) {
    const p = POSTS[i];
    const slug = await uniqueSlug(slugify(p.title));
    const body = content(p.title, p.tags);
    const created = await prisma.post.create({ data: {
      title: p.title, slug, excerpt: p.excerpt, content: body, coverImage: cover(slug), published: true, featured: i === 0, viewCount: 200 + Math.floor(Math.random()*3000), readTime: readTime(body), wordCount: body.split(/\s+/).filter(Boolean).length, charCount: body.length, authorId: a.id, publishedAt: dayOffset(POSTS.length - i), seoTitle: p.title, seoDescription: p.excerpt, seoImage: cover(slug), metaKeywords: [...new Set((p.title + ' ' + p.tags.join(' ')).toLowerCase().split(/\s+/))].slice(0, 15).join(', ') } });
    await prisma.postCategory.create({ data: { postId: created.id, categoryId: cat.id } });
    for (const t of p.tags) { const tg = await upsertTag(slugify(t)); await prisma.postTag.create({ data: { postId: created.id, tagId: tg.id } }); }
    count += 1; console.log(`✓ Created ${created.slug}`);
  }
  console.log(`✅ Done. Created ${count} Programming Languages posts.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });


