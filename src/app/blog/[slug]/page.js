import Layout from '@/components/layout/Layout';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import { getPostBySlug } from '@/lib/posts';
import { Badge } from '@/components/ui';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { getAllPosts } from '@/lib/posts';
import SocialShare from '@/components/blog/SocialShare';
import TableOfContents from '@/components/blog/TableOfContents';
import ReadingProgress from '@/components/blog/ReadingProgress';
import Link from 'next/link';

export default function PostPage({ params }) {
  const slug = params.slug;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch (e) {
    post = null;
  }

  if (!post) {
    return (
      <Layout showSidebar={true}>
        <div className="text-center py-24 text-2xl text-muted-foreground">Post not found.</div>
      </Layout>
    );
  }

  // Load all posts for related posts and navigation
  const { posts: allPosts } = getAllPosts({ page: 1, limit: 100 });
  // Find current post index
  const idx = allPosts.findIndex(p => p.slug === post.slug);
  const prevPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const nextPost = idx > 0 ? allPosts[idx - 1] : null;

  return (
    <Layout showSidebar={true}>
      {/* Breadcrumbs */}
      <nav className="text-sm mb-4">
        <Link href="/" className="text-muted-foreground hover:underline">Home</Link> /
        <Link href="/blog" className="text-muted-foreground hover:underline">Blog</Link> /
        <span className="text-foreground">{post.title}</span>
      </nav>
      <ReadingProgress />
      <div className="max-w-3xl mx-auto py-12">
        <TableOfContents content={post.content} />
        <article>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>{post.title}</h1>
          <div className="flex flex-wrap gap-4 items-center mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span>By {post.author}</span>
            <span>{formatDate(post.date)}</span>
            <span>{calculateReadingTime(post.content)} min read</span>
            {post.categories && post.categories.map((cat) => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
          <div className="mb-8">
            <img src={post.coverImage} alt={post.title} className="rounded-lg w-full max-h-96 object-cover" />
          </div>
          <MarkdownRenderer content={post.content} />
          <SocialShare title={post.title} slug={post.slug} />
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags && post.tags.map((tag) => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
        </article>
        {/* Previous/Next Navigation */}
        <div className="flex justify-between mt-12">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="text-primary hover:underline">← {prevPost.title}</Link>
          ) : <span />}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="text-primary hover:underline">{nextPost.title} →</Link>
          ) : <span />}
        </div>
      </div>
      <RelatedPosts post={post} allPosts={allPosts} />
    </Layout>
  );
}