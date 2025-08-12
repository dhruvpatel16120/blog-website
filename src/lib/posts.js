import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// Read all post slugs
export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
}

// Get post by slug
export function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    slug: realSlug,
    ...data,
    content,
  };
}

// Get all posts (optionally paginated)
export function getAllPosts({ page = 1, limit = 5 } = {}) {
  const slugs = getPostSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));
  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = posts.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    posts: posts.slice(start, end),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get posts by category
export function getPostsByCategory(category) {
  const slugs = getPostSlugs();
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter(post =>
      Array.isArray(post.categories)
        ? post.categories.map(c => c.toLowerCase()).includes(category.toLowerCase())
        : false
    );
}

// Get posts by tag
export function getPostsByTag(tag) {
  const slugs = getPostSlugs();
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter(post =>
      Array.isArray(post.tags)
        ? post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        : false
    );
}

// Search posts by query (title, excerpt, tags)
export function searchPosts(query) {
  const slugs = getPostSlugs();
  const q = query.toLowerCase();
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(q)))
    );
}