import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// audit removed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-combined';

function slugifyTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: true, likes: true } }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
      featured: post.featured,
      coverImage: post.coverImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      _count: post._count,
      publishedAt: post.publishedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoImage: post.seoImage,
      metaKeywords: post.metaKeywords,
      readTime: post.readTime,
      wordCount: post.wordCount,
      charCount: post.charCount,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    // Auto-save lightweight path
    if (body.autoSave && typeof body.content === 'string') {
      const readTimeCalc = Math.ceil(String(body.content).split(/\s+/).length / 200);
      await prisma.post.update({
        where: { id },
        data: { content: body.content, readTime: readTimeCalc },
      });
      return NextResponse.json({ success: true });
    }

    // Whitelist and map fields
    const {
      title,
      content,
      excerpt,
      coverImage,
      published,
      featured,
      seoTitle,
      seoDescription,
      seoImage,
      metaKeywords,
      publishedAt,
      readingTime,
      wordCount,
      charCount,
      customSlug,
      categories,
      tags,
    } = body;

    const data = {
      ...(title != null ? { title } : {}),
      ...(typeof content === 'string' ? { content } : {}),
      ...(excerpt != null ? { excerpt } : {}),
      ...(coverImage != null ? { coverImage } : {}),
      ...(published != null ? { published: Boolean(published) } : {}),
      ...(featured != null ? { featured: Boolean(featured) } : {}),
      ...(seoTitle != null ? { seoTitle } : {}),
      ...(seoDescription != null ? { seoDescription } : {}),
      ...(seoImage != null ? { seoImage } : {}),
      ...(metaKeywords != null ? { metaKeywords } : {}),
      ...(publishedAt != null ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      ...(wordCount != null ? { wordCount: Number(wordCount) } : {}),
      ...(charCount != null ? { charCount: Number(charCount) } : {}),
    };

    // Map readingTime -> readTime or recalc if content is provided
    if (readingTime != null) {
      data.readTime = Number(readingTime);
    } else if (typeof content === 'string') {
      data.readTime = Math.ceil(String(content).split(/\s+/).length / 200);
    }

    // Handle slug updates
    if (customSlug && typeof customSlug === 'string') {
      const baseSlug = slugifyTitle(customSlug);
      let slug = baseSlug || slugifyTitle(title || '');
      let counter = 1;
      while (await prisma.post.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      data.slug = slug;
    } else if (title && !body.slug) {
      const baseSlug = slugifyTitle(title);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.post.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      data.slug = slug;
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.update({ where: { id }, data });

      if (Array.isArray(categories)) {
        await tx.postCategory.deleteMany({ where: { postId: id } });
        if (categories.length) {
          await tx.postCategory.createMany({ data: categories.map(categoryId => ({ postId: id, categoryId })), skipDuplicates: true });
        }
      }

      if (Array.isArray(tags)) {
        await tx.postTag.deleteMany({ where: { postId: id } });
        if (tags.length) {
          await tx.postTag.createMany({ data: tags.map(tagId => ({ postId: id, tagId })), skipDuplicates: true });
        }
      }
    });

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { comments: true, likes: true } }
      }
    });

    const mapped = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
      featured: post.featured,
      coverImage: post.coverImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      _count: post._count,
      publishedAt: post.publishedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoImage: post.seoImage,
      metaKeywords: post.metaKeywords,
      readTime: post.readTime,
      wordCount: post.wordCount,
      charCount: post.charCount,
    };

    // audit removed

    return NextResponse.json({ data: mapped });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const postWithCounts = await prisma.post.findUnique({
      where: { id },
      include: { _count: { select: { comments: true } } }
    });

    if (!postWithCounts) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (postWithCounts._count.comments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete post with existing comments' },
        { status: 400 }
      );
    }

    await prisma.postTag.deleteMany({ where: { postId: id } });
    await prisma.postCategory.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    // audit removed

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
