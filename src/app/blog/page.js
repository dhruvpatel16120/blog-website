import Layout from '@/components/layout/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { Button } from '@/components/ui';
import { getAllPosts } from '@/lib/posts';

export default async function BlogPage({ searchParams }) {
  // Get current page from query params (default to 1)
  const page = parseInt(searchParams?.page || '1', 10);
  const limit = 5;
  const { posts, total, totalPages } = getAllPosts({ page, limit });
  const { posts: sidebarPosts } = getAllPosts({ page: 1, limit: 100 });

  return (
    <Layout showSidebar={true} sidebarPosts={sidebarPosts}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blog</h1>
        <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>
          Discover insights, tutorials, and best practices in modern web development
        </p>
      </div>

      {/* Blog Grid */}
      <BlogGrid posts={posts} />

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            as="a"
            href={`?page=${page - 1}`}
            disabled={page <= 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, idx) => (
            <Button
              key={idx + 1}
              size="sm"
              as="a"
              href={`?page=${idx + 1}`}
              variant={page === idx + 1 ? undefined : 'outline'}
            >
              {idx + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            as="a"
            href={`?page=${page + 1}`}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export const dynamic = 'force-static';
export const revalidate = 60; 