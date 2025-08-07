import BlogCard from './BlogCard';

export default function RelatedPosts({ post, allPosts }) {
  if (!post || !allPosts) return null;
  // Find related posts by category or tag
  const related = allPosts.filter(p =>
    p.slug !== post.slug &&
    (
      (Array.isArray(p.categories) && Array.isArray(post.categories) && p.categories.some(cat => post.categories.includes(cat))) ||
      (Array.isArray(p.tags) && Array.isArray(post.tags) && p.tags.some(tag => post.tags.includes(tag)))
    )
  ).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map(post => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}