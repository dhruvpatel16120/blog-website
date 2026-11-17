import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import { prisma } from '@/lib/db';
import { Badge, Button } from '@/components/ui';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import HTMLRenderer from '@/components/blog/HTMLRenderer';
import TableOfContents from '@/components/blog/TableOfContents';
import ReadingProgress from '@/components/blog/ReadingProgress';
import SocialShare from '@/components/blog/SocialShare';
import PostEngagement from '@/components/blog/PostEngagement';
import Comments from '@/components/blog/Comments';
import RelatedPosts from '@/components/blog/RelatedPosts';
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserCircleIcon,
  SparklesIcon,
  GlobeAltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default async function PostPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  const session = await getServerSession(authOptions);

  // Fetch post with author details, categories, tags, likes, and counts
  const p = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          avatar: true,
          bio: true,
          website: true,
          location: true,
        },
      },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      likes: {
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              bio: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!p || !p.published) {
    notFound();
  }

  // Check if current user liked this post
  let initialLiked = false;
  if (session?.user?.id) {
    initialLiked = p.likes.some((l) => l.user.id === session.user.id);
  }

  const initialLikedUsers = p.likes.map((l) => l.user).filter(Boolean);

  const post = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    author: p.author,
    date: p.publishedAt,
    coverImage: p.coverImage,
    tags: p.tags?.map((t) => t.tag) || [],
    categories: p.categories?.map((c) => c.category) || [],
    commentCount: p._count.comments,
    likesCount: p._count.likes,
    contentType: p.contentType || 'html',
  };

  const readingTime = calculateReadingTime(post.content);

  // Fetch previous, next, and related posts in parallel
  const categoryIds = post.categories.map((c) => c.id);
  const [prevPost, nextPost, relatedPostsRaw] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, publishedAt: { lt: p.publishedAt } },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    }),
    prisma.post.findFirst({
      where: { published: true, publishedAt: { gt: p.publishedAt } },
      orderBy: { publishedAt: 'asc' },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    }),
    prisma.post.findMany({
      where: {
        published: true,
        slug: { not: post.slug },
        ...(categoryIds.length > 0
          ? { categories: { some: { categoryId: { in: categoryIds } } } }
          : {}),
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
        publishedAt: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const relatedPosts = relatedPostsRaw.map((rp) => ({
    id: rp.id,
    slug: rp.slug,
    title: rp.title,
    excerpt: rp.excerpt,
    coverImage: rp.coverImage,
    readTime: rp.readTime,
    date: rp.publishedAt,
    categories: rp.categories?.map((c) => c.category.name) || [],
    tags: rp.tags?.map((t) => t.tag.name) || [],
    author: { name: rp.author?.fullName || rp.author?.username || 'Author' },
    commentCount: rp._count?.comments || 0,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <ReadingProgress />

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Articles</span>
        </Link>

        {/* Categories Badges */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {post.categories.map((cat) => (
              <Link key={cat.id || cat.slug} href={`/categories/${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-[var(--accent)] text-xs font-semibold px-3 py-1 rounded-full border border-[var(--border)]"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.15] mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-6 font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Author Byline & Meta Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs sm:text-sm">
          {/* Author info with link to public profile */}
          <Link
            href={`/profile/${post.author?.username || 'user'}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 shrink-0 ring-2 ring-[var(--border)] group-hover:ring-blue-500 transition-all">
              {post.author?.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.fullName || post.author.username}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white uppercase">
                  {(post.author?.fullName || post.author?.username || 'A')[0]}
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                <span>{post.author?.fullName || post.author?.username || 'Author'}</span>
                <span className="text-[11px] font-normal text-[var(--muted-foreground)]">
                  (@{post.author?.username})
                </span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] block">
                Author & Contributor
              </span>
            </div>
          </Link>

          {/* Meta details */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{formatDate(post.date)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{readingTime} min read</span>
            </div>

            <a
              href="#comments"
              className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
            >
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-purple-500 shrink-0" />
              <span>{post.commentCount} comments</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Cover Image */}
      {post.coverImage?.trim() && (
        <div className="relative w-full h-64 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden border border-[var(--border)] mb-10 shadow-sm">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Table of Contents */}
      <TableOfContents content={post.content} />

      {/* Main Article Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-500 hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-[var(--border)] leading-relaxed">
        {post.contentType === 'markdown' ? (
          <MarkdownRenderer content={post.content} />
        ) : post.contentType === 'html' ? (
          <HTMLRenderer content={post.content} />
        ) : (
          <div className="whitespace-pre-wrap">{post.content}</div>
        )}
      </article>

      {/* Tags List */}
      {post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            Topics in this article
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id || tag.name} href={`/tags/${tag.slug || tag.name}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-[var(--accent)] text-xs font-medium px-3 py-1 rounded-full border border-[var(--border)] text-[var(--foreground)]"
                >
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Like and Engagement Section (with View Liked Users & Public Profile links) */}
      <PostEngagement
        postSlug={post.slug}
        initialLikesCount={post.likesCount}
        initialLiked={initialLiked}
        initialLikedUsers={initialLikedUsers}
        commentCount={post.commentCount}
        postTitle={post.title}
      />

      {/* Author Spotlight Box */}
      {post.author && (
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] my-12 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Link
              href={`/profile/${post.author.username}`}
              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 shrink-0 ring-2 ring-[var(--border)] hover:ring-blue-500 transition-all"
            >
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.fullName || post.author.username}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xl font-bold text-white uppercase">
                  {(post.author.fullName || post.author.username || 'A')[0]}
                </span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">
                    Written by {post.author.fullName || post.author.username}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    @{post.author.username}
                  </p>
                </div>

                <Link
                  href={`/profile/${post.author.username}`}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  View Profile & Posts →
                </Link>
              </div>

              {post.author.bio && (
                <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {post.author.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                {post.author.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                    {post.author.location}
                  </span>
                )}
                {post.author.website && (
                  <a
                    href={post.author.website.startsWith('http') ? post.author.website : `https://${post.author.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-500 hover:underline"
                  >
                    <GlobeAltIcon className="w-3.5 h-3.5 text-blue-500" />
                    {post.author.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Share Section */}
      <SocialShare title={post.title} slug={post.slug} excerpt={post.excerpt} />

      {/* Previous / Next Article Navigation Cards */}
      {(prevPost || nextPost) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-12 pt-8 border-t border-[var(--border)]">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/50 hover:shadow-md transition-all group block"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] group-hover:text-blue-500 mb-1.5">
                <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Previous Article</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] line-clamp-2">
                {prevPost.title}
              </h4>
            </Link>
          ) : (
            <div />
          )}

          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/50 hover:shadow-md transition-all group block text-right"
            >
              <div className="flex items-center justify-end gap-2 text-xs font-semibold text-[var(--muted-foreground)] group-hover:text-blue-500 mb-1.5">
                <span>Next Article</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] line-clamp-2">
                {nextPost.title}
              </h4>
            </Link>
          )}
        </div>
      )}

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />

      {/* Comments Section */}
      <div id="comments" className="mt-16 pt-10 border-t border-[var(--border)]">
        <Comments postId={post.id} postSlug={post.slug} />
      </div>
    </div>
  );
}
