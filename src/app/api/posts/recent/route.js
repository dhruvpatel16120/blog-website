import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '6', 10)));

    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
        publishedAt: true,
        viewCount: true,
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      readTime: post.readTime,
      publishedAt: post.publishedAt,
      viewCount: post.viewCount,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      author: {
        ...post.author,
        avatar: post.author.avatar || generateAvatarUrl(post.author.fullName, post.author.username),
      },
      categories: post.categories.map((c) => c.category),
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
