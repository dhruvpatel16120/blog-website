import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { Badge } from '@/components/ui';
import { getPostsByTag } from '@/lib/posts';

export default function TagPage() {
  const params = useParams();
  const tagSlug = params.tag;
  const tagName = tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1).replace(/-/g, ' ');

  const posts = getPostsByTag(tagSlug);

  return (
    <Layout showSidebar={true}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Posts tagged: {tagName}
        </h1>
        <Badge variant="secondary" className="text-xs mb-4">
          {posts.length} posts
        </Badge>
      </div>
      {posts.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground py-12">
          No posts found for this tag.
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </Layout>
  );
}