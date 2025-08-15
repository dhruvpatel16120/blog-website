import React from 'react';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { getAllPosts } from '@/lib/posts';
import SocialShare from '@/components/blog/SocialShare';
import TableOfContents from '@/components/blog/TableOfContents';
import ReadingProgress from '@/components/blog/ReadingProgress';
import Comments from '@/components/blog/Comments';
import Link from 'next/link';
import Image from 'next/image';
import HTMLRenderer from '@/components/blog/HTMLRenderer';

export default async function PostPage({ params }) {
  const { slug } = await params;
  const p = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  const post = p && p.published ? {
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    author: p.author,
    date: p.publishedAt,
    coverImage: p.coverImage,
    tags: p.tags?.map(t => t.tag.name) || [],
    categories: p.categories?.map(c => c.category.name) || [],
    commentCount: p._count.comments,
    contentType: p.contentType || 'html', // Default to HTML if not specified
  } : null;

  if (!post) {
    const { posts: sidebarPosts } = getAllPosts({ page: 1, limit: 100 });
    return (
      <>
        <div className="text-center py-24 text-2xl text-muted-foreground">Post not found.</div>
      </>
    );
  }

  // Load all posts for related posts and navigation
  const allPostsRaw = await prisma.post.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' }, take: 100, select: { slug: true, title: true } });
  const allPosts = allPostsRaw.map(pp => ({ slug: pp.slug, title: pp.title }));
  // Find current post index
  const idx = allPosts.findIndex(p => p.slug === post.slug);
  const prevPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const nextPost = idx > 0 ? allPosts[idx - 1] : null;

  return (
    <>
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
            <span>By {post.author?.fullName || post.author?.username || 'Unknown Author'}</span>
            <span>{formatDate(post.date)}</span>
            <span>{calculateReadingTime(post.content)} min read</span>
            <span>{post.commentCount} comments</span>
            {post.categories && post.categories.map((cat) => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
          <div className="mb-8">
            {post.coverImage?.trim() ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={600}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="rounded-lg w-full max-h-96 object-cover"
                priority
              />
            ) : null}
          </div>
          {post.contentType === 'markdown' ? (
            <MarkdownRenderer content={post.content} />
          ) : post.contentType === 'html' ? (
            <HTMLRenderer content={post.content} />
          ) : (
            <div className="prose max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>
          )}
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
      {post && <Comments postId={post.id} postSlug={post.slug} />}
      <RelatedPosts post={post} allPosts={allPosts} />
    </>
  );
}