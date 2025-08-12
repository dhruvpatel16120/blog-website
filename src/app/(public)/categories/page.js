import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getIconComponent } from '@/lib/icons'
import BlogGrid from '@/components/blog/BlogGrid'
import { Badge } from '@/components/ui'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { posts: true } } },
  });

  // Load a few featured posts per category (latest 2)
  const categoryIds = categories.map((c) => c.id);
  const postsByCategory = new Map();
  if (categoryIds.length > 0) {
    const posts = await prisma.post.findMany({
      where: { published: true, categories: { some: { categoryId: { in: categoryIds } } } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true, slug: true, title: true, excerpt: true, coverImage: true, readTime: true, publishedAt: true,
        categories: { select: { categoryId: true } },
      },
    });
    for (const p of posts) {
      for (const c of p.categories) {
        if (!postsByCategory.has(c.categoryId)) postsByCategory.set(c.categoryId, []);
        postsByCategory.get(c.categoryId).push(p);
      }
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Categories</h1>
        <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>
          Explore our content by category and discover topics that interest you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon || 'CodeBracketIcon');
          const featured = (postsByCategory.get(category.id) || []).slice(0, 2);
          return (
            <Link key={category.id} href={`/categories/${category.slug}`} className="card p-6 hover:shadow-lg transition-all duration-300 group block" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <Icon className="w-6 h-6" style={{ color: category.color || 'var(--primary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{category.name}</h3>
                    <Badge variant="secondary" className="text-xs">{category._count.posts} posts</Badge>
                  </div>
                </div>
              </div>
              {category.description && (
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{category.description}</p>
              )}
              {featured.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Featured Posts</h4>
                  {featured.map((post) => (
                    <div key={post.id} className="text-sm group-hover:text-primary transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{post.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Can&apos;t find what you&apos;re looking for?
        </h2>
        <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Browse all our categories or use the search function to find specific content
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {category.name} ({category._count.posts})
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}