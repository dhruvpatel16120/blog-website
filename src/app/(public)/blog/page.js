import React from 'react';
import BlogGrid from '@/components/blog/BlogGrid';
import { Button } from '@/components/ui';
import { prisma } from '@/lib/db';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const page = parseInt(sp?.page || '1', 10);
  const limit = 9;
  const sort = (sp?.sort || 'newest').toString();
  const search = sp?.search || '';
  const category = sp?.category || '';
  const tag = sp?.tag || '';

  const orderBy = (() => {
    switch (sort) {
      case 'oldest':
        return { publishedAt: 'asc' };
      case 'title':
        return { title: 'asc' };
      case 'readTime':
        return { readTime: 'desc' };
      case 'views':
        return { viewCount: 'desc' };
      case 'comments':
        return { comments: { _count: 'desc' } };
      default:
        return { publishedAt: 'desc' };
    }
  })();

  // Build where clause for filtering
  const where = { published: true };
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { author: { is: { fullName: { contains: search, mode: 'insensitive' } } } },
      { author: { is: { username: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          name: { equals: category, mode: 'insensitive' }
        }
      }
    };
  }

  if (tag) {
    where.tags = {
      some: {
        tag: {
          name: { equals: tag, mode: 'insensitive' }
        }
      }
    };
  }

  // Get total count and posts
  const [total, prismaPosts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, 
        slug: true, 
        title: true, 
        excerpt: true, 
        content: true, 
        coverImage: true, 
        readTime: true, 
        publishedAt: true, 
        viewCount: true,
        categories: { 
          include: { 
            category: { 
              select: { name: true } 
            } 
          } 
        },
        tags: { 
          include: { 
            tag: { 
              select: { name: true } 
            } 
          } 
        },
        author: { 
          select: { 
            fullName: true, 
            username: true 
          } 
        },
        _count: { 
          select: { 
            comments: true 
          } 
        }
      }
    })
  ]);

  // Get categories and tags for filters
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      select: { name: true, _count: { select: { posts: true } } },
      where: { posts: { some: { post: { published: true } } } },
      orderBy: { name: 'asc' }
    }),
    prisma.tag.findMany({
      select: { name: true, _count: { select: { posts: true } } },
      where: { posts: { some: { post: { published: true } } } },
      orderBy: { name: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(total / limit);
  const posts = prismaPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    readTime: p.readTime,
    date: p.publishedAt,
    categories: p.categories?.map(c => c.category.name) || [],
    tags: p.tags?.map(t => t.tag.name) || [],
    author: { name: p.author?.fullName || p.author?.username || 'Author' },
    commentCount: p._count.comments,
  }));

  // Generate pagination range
  const generatePaginationRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const paginationRange = generatePaginationRange(page, totalPages);

  // Build URL with current params
  const buildUrl = (newParams) => {
    const params = new URLSearchParams();

    // Start from current, known keys only, coerced to strings
    const current = {
      page: page ? String(page) : '',
      sort,
      search,
      category,
      tag,
    };

    const merged = { ...current, ...Object.fromEntries(Object.entries(newParams).map(([k, v]) => [k, v == null ? '' : String(v)])) };

    Object.entries(merged).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    return query ? `?${query}` : '?';
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>Blog</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {total} post{total !== 1 ? 's' : ''} • Page {page} of {totalPages}
          </div>
        </div>
        <p className="text-xl mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Discover insights, tutorials, and best practices in modern web development
        </p>

        {/* Search and Filters */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
             style={{ background: 'var(--card)' }}>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" method="GET">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search posts..."
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--card)] text-[var(--foreground)]"
              />
            </div>

            {/* Category Filter */}
            <select
              name="category"
              defaultValue={category}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--card)] text-[var(--foreground)]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat._count.posts})
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              name="tag"
              defaultValue={tag}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--card)] text-[var(--foreground)]"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t._count.posts})
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--card)] text-[var(--foreground)]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="readTime">Longest Read</option>
              <option value="views">Most Views</option>
              <option value="comments">Most Comments</option>
            </select>

            <div className="flex items-end">
              <Button as="button" type="submit" variant="outline" className="w-full">Apply</Button>
            </div>
          </form>

          {/* Active Filters Display */}
          {(search || category || tag) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Search: &quot;{search}&quot;
                  <a href={buildUrl({ search: '' })} className="ml-2 text-blue-600 hover:text-blue-800">×</a>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Category: {category}
                  <a href={buildUrl({ category: '' })} className="ml-2 text-green-600 hover:text-green-800">×</a>
                </span>
              )}
              {tag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Tag: {tag}
                  <a href={buildUrl({ tag: '' })} className="ml-2 text-purple-600 hover:text-purple-800">×</a>
                </span>
              )}
              <a 
                href="?" 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Clear All
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <BlogGrid posts={posts} />

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                as="a"
                href={buildUrl({ page: 1 })}
                disabled={page <= 1}
                className="px-2"
              >
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                as="a"
                href={buildUrl({ page: page - 1 })}
                disabled={page <= 1}
                className="px-2"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              {paginationRange.map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Button
                    key={pageNum}
                    size="sm"
                    as="a"
                    href={buildUrl({ page: pageNum })}
                    variant={page === pageNum ? undefined : 'outline'}
                    className="px-3"
                  >
                    {pageNum}
                  </Button>
                )
              ))}

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                as="a"
                href={buildUrl({ page: page + 1 })}
                disabled={page >= totalPages}
                className="px-2"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                as="a"
                href={buildUrl({ page: totalPages })}
                disabled={page >= totalPages}
                className="px-2"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text_WHITE mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {search || category || tag 
                ? "Try adjusting your search criteria or filters."
                : "Check back later for new content!"
              }
            </p>
            {(search || category || tag) && (
              <a 
                href="?" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}