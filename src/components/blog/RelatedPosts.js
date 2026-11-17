import BlogCard from './BlogCard';

export default function RelatedPosts({ posts, post, allPosts }) {
  // Support both direct posts array and legacy (post, allPosts) filtering
  let related = [];
  if (Array.isArray(posts) && posts.length > 0) {
    related = posts;
  } else if (post && Array.isArray(allPosts)) {
    related = allPosts.filter(p =>
      p.slug !== post.slug &&
      (
        (Array.isArray(p.categories) && Array.isArray(post.categories) && p.categories.some(cat => post.categories.includes(cat))) ||
        (Array.isArray(p.tags) && Array.isArray(post.tags) && p.tags.some(tag => post.tags.includes(tag)))
      )
    ).slice(0, 3);
  }

  if (!related || related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[var(--border)]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Related Articles
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Continue exploring curated articles from similar categories and tags
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map(p => (
          <BlogCard key={p.slug || p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
