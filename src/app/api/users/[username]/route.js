import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/utils';
import { getPrivacy } from '@/lib/privacy';

export async function GET(request, { params }) {
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check user first
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        createdAt: true,
        role: true,
        posts: {
          where: { published: true },
          orderBy: { publishedAt: 'desc' },
          take: 30,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            readTime: true,
            publishedAt: true,
            viewCount: true,
            categories: {
              select: {
                category: {
                  select: { name: true, slug: true, color: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            posts: { where: { published: true } },
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (user) {
      const privacy = getPrivacy(user.id);

      let likedPosts = [];
      if (privacy.showLikedPosts) {
        const userLikes = await prisma.like.findMany({
          where: { userId: user.id },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                readTime: true,
                publishedAt: true,
                categories: {
                  select: {
                    category: { select: { name: true, slug: true } },
                  },
                },
              },
            },
          },
        });
        likedPosts = userLikes.filter((l) => l.post !== null).map((l) => l.post);
      }

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar || generateAvatarUrl(user.fullName, user.username),
          email: privacy.showEmail ? user.email : null,
          bio: user.bio,
          website: user.website,
          location: user.location,
          createdAt: user.createdAt,
          role: user.role,
          type: 'user',
          privacy: {
            showEmail: privacy.showEmail,
            showLikedPosts: privacy.showLikedPosts,
          },
          stats: {
            postCount: user._count.posts,
            commentCount: user._count.comments,
            likeCount: privacy.showLikedPosts ? user._count.likes : null,
          },
          posts: user.posts,
          likedPosts,
        },
      });
    }

    // Check admin
    const admin = await prisma.admin.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (admin) {
      const postCount = await prisma.post.count({ where: { published: true } });
      const privacy = getPrivacy(admin.id);
      return NextResponse.json({
        user: {
          id: admin.id,
          username: admin.username,
          fullName: admin.fullName,
          avatar: admin.avatar || generateAvatarUrl(admin.fullName, admin.username),
          email: privacy.showEmail ? admin.email : null,
          bio: 'Platform Administrator & Technical Lead',
          website: '',
          location: 'Global',
          createdAt: admin.createdAt,
          role: admin.role,
          type: 'admin',
          privacy: {
            showEmail: privacy.showEmail,
            showLikedPosts: privacy.showLikedPosts,
          },
          stats: {
            postCount,
            commentCount: 0,
            likeCount: null,
          },
          posts: [],
        },
      });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
