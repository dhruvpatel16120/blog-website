import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { trackActivity } from '@/lib/activity';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get all versions of the post
    const versions = await prisma.postVersion.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      versions: versions.map(version => ({
        id: version.id,
        title: version.title,
        excerpt: version.excerpt,
        content: version.content,
        coverImage: version.coverImage,
        published: version.published,
        featured: version.featured,
        createdAt: version.createdAt,
        authorId: version.authorId
      }))
    });

  } catch (error) {
    console.error('Error fetching post versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post versions' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { title, excerpt, content, coverImage, published, featured, authorId } = await request.json();

    // Create a new version
    const version = await prisma.postVersion.create({
      data: {
        postId: id,
        title,
        excerpt,
        content,
        coverImage,
        published,
        featured,
        authorId
      }
    });

    // Track activity
    await trackActivity({
      type: 'post_version_created',
      adminId: authorId,
      entity: 'Post',
      entityId: id,
      metadata: {
        title,
        versionId: version.id,
        description: `New version created for post "${title}"`
      }
    });

    return NextResponse.json({
      success: true,
      version: {
        id: version.id,
        title: version.title,
        createdAt: version.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating post version:', error);
    return NextResponse.json(
      { error: 'Failed to create post version' },
      { status: 500 }
    );
  }
}
