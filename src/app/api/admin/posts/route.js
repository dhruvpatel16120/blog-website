import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';
import bcrypt from 'bcryptjs';

async function ensureAuthorUserForAdmin(session) {
  // If posts are authored by Users, ensure the admin also exists as a User
  // Return a valid userId to use as authorId
  if (!session?.user) return null;
  const username = session.user.username || `admin_${session.user.id}`;
  const email = session.user.email || `${username}@admin.local`;
  const fullName = session.user.fullName || username;

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existingUser) return existingUser.id;

  const randomPassword = await bcrypt.hash(`admin-${session.user.id}-${Date.now()}`, 10);
  const created = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      password: randomPassword,
      avatar: session.user.avatar || null,
      bio: 'System user for admin-authored posts',
    }
  });
  return created.id;
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /api/admin/posts?q=&status=&categoryId=&tagId=&authorId=&featured=&sortBy=&order=&page=&limit=&dateFrom=&dateTo=
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status') || 'all'; // all|published|draft|scheduled
    const categoryId = searchParams.get('categoryId') || undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const featured = searchParams.get('featured');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const where = {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { excerpt: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status === 'published'
        ? { published: true }
        : status === 'draft'
        ? { published: false }
        : status === 'scheduled'
        ? { published: false, publishedAt: { gt: new Date() } }
        : {}),
      ...(authorId ? { authorId } : {}),
      ...(categoryId ? { categories: { some: { categoryId } } } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
      ...(featured === 'true' ? { featured: true } : featured === 'false' ? { featured: false } : {}),
      ...(dateFrom || dateTo
        ? { createdAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
        : {}),
    };

    const orderBy = (() => {
      if (sortBy === 'title') return { title: order };
      if (sortBy === 'updatedAt') return { updatedAt: order };
      if (sortBy === 'publishedAt') return { publishedAt: order };
      if (sortBy === 'views') return { viewCount: order };
      if (sortBy === 'comments') return { comments: { _count: order } };
      return { createdAt: order };
    })();

    const [total, items] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy,
        include: {
          author: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { comments: true, likes: true } },
        },
        skip,
        take: limit,
      }),
    ]);

    // Calculate summary statistics from the full dataset (not paginated)
    const [totalPosts, publishedPosts, draftPosts, featuredPosts, scheduledPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.count({ where: { featured: true } }),
      prisma.post.count({ 
        where: { 
          published: false, 
          publishedAt: { gt: new Date() } 
        } 
      }),
    ]);

    const data = items.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.published ? 'published' : 'draft',
      coverImage: post.coverImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      viewCount: post.viewCount || 0,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      publishedAt: post.publishedAt,
      featured: post.featured,
    }));

    return NextResponse.json({ 
      data, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      summary: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        featured: featuredPosts,
        scheduled: scheduledPosts,
      },
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      published,
      featured,
      categories = [],
      tags = [],
      seoTitle,
      seoDescription,
      seoImage,
      publishedAt,
      customSlug,
      metaKeywords,
      readingTime,
      wordCount,
      charCount,
      contentType,
      authorId: requestedAuthorId,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = customSlug ? slugifyTitle(customSlug) : slugifyTitle(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Determine author ID - use requested authorId if provided, otherwise ensure an author User exists for this admin
    let authorId;
    if (requestedAuthorId) {
      // Verify the requested author exists and is a valid user
      const requestedAuthor = await prisma.user.findFirst({
        where: { id: requestedAuthorId, isActive: true }
      });
      if (!requestedAuthor) {
        return NextResponse.json({ error: 'Invalid author ID provided' }, { status: 400 });
      }
      authorId = requestedAuthorId;
    } else {
      // Fall back to automatic author resolution
      authorId = await ensureAuthorUserForAdmin(session);
      if (!authorId) {
        return NextResponse.json({ error: 'Unable to resolve author' }, { status: 500 });
      }
    }

    // Create in transaction to ensure relations stay consistent
    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || null,
          coverImage: coverImage || null,
          published: Boolean(published),
          featured: Boolean(featured),
          authorId,
          publishedAt: published ? new Date() : (publishedAt ? new Date(publishedAt) : null),
          readTime: readingTime || Math.ceil(String(content).split(/\s+/).length / 200),
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt || '',
          seoImage: seoImage || coverImage || null,
          metaKeywords: metaKeywords || null,
          wordCount: wordCount || String(content).split(/\s+/).filter(word => word.length > 0).length,
          charCount: charCount || String(content).length,
          contentType: contentType || 'html',
        },
      });

      if (Array.isArray(categories) && categories.length) {
        await tx.postCategory.createMany({ data: categories.map((categoryId) => ({ postId: created.id, categoryId })), skipDuplicates: true });
      }
      if (Array.isArray(tags) && tags.length) {
        await tx.postTag.createMany({ data: tags.map((tagId) => ({ postId: created.id, tagId })), skipDuplicates: true });
      }
      return created;
    });

    const created = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      }
    });

    // audit removed

    const mapped = {
      id: created.id,
      title: created.title,
      slug: created.slug,
      excerpt: created.excerpt,
      content: created.content,
      published: created.published,
      featured: created.featured,
      coverImage: created.coverImage,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      author: created.author,
      authorId: created.authorId,
      categories: created.categories.map(pc => pc.category),
      tags: created.tags.map(pt => pt.tag),
      publishedAt: created.publishedAt,
      seoTitle: created.seoTitle,
      seoDescription: created.seoDescription,
      seoImage: created.seoImage,
      metaKeywords: created.metaKeywords,
      readTime: created.readTime,
      wordCount: created.wordCount,
      charCount: created.charCount,
      contentType: created.contentType,
      // alias for client expectations
      readingTime: created.readTime,
    };

    return NextResponse.json({ data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
