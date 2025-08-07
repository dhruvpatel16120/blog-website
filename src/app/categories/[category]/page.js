import Layout from '@/components/layout/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { Badge } from '@/components/ui';
import { getPostsByCategory } from '@/lib/posts';

export default function CategoryPage({ params }) {
  const categorySlug = params.category;
  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');

  const posts = getPostsByCategory(categorySlug);

  return (
    <Layout showSidebar={true}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          {categoryName} Posts
        </h1>
        <Badge variant="secondary" className="text-xs mb-4">
          {posts.length} posts
        </Badge>
      </div>
      {posts.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground py-12">
          No posts found for this category.
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </Layout>
  );
}