import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    // Transform the data to match the frontend expectations
    const transformedPosts = posts.map(post => ({
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
      category: post.category,
      tags: post.tags.map(pt => pt.tag),
      viewCount: post.viewCount || 0,
      commentCount: post._count.comments,
      likeCount: post._count.likes
    }));

    return NextResponse.json(transformedPosts);

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
    
    if (!session || session.user.role !== 'ADMIN') {
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
      categories,
      tags,
      relatedPosts
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json({ error: 'A post with this title already exists' }, { status: 400 });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        featured,
        authorId: session.user.id,
        publishedAt: published ? new Date() : null,
        readTime: Math.ceil(content.split(' ').length / 200), // Rough estimate
        seoTitle: body.seoTitle || title,
        seoDescription: body.seoDescription || excerpt || '',
        seoImage: body.seoImage || coverImage || null,
        categories: {
          create: categories?.map(catId => ({
            category: { connect: { id: catId } }
          })) || []
        },
        tags: {
          create: tags?.map(tagId => ({
            tag: { connect: { id: tagId } }
          })) || []
        }
      },
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    });

    // audit
    await recordAudit({ userId: session.user.id, action: 'POST_CREATE', entity: 'Post', entityId: post.id, metadata: { title } });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
