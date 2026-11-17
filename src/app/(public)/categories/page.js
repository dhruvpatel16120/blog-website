import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getIconComponent } from '@/lib/icons'
import { Badge } from '@/components/ui'
import { publicDataCache } from '@/lib/cache'

export const revalidate = 180; // ISR 3 minutes

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Web Development', slug: 'web-development', description: 'Modern frontend, backend, and full-stack web engineering.', color: '#3b82f6', icon: 'CodeBracketIcon', _count: { posts: 14 } },
  { id: '2', name: 'JavaScript & React', slug: 'javascript-react', description: 'Deep dives into modern JS, React, and ecosystem libraries.', color: '#8b5cf6', icon: 'CpuChipIcon', _count: { posts: 11 } },
  { id: '3', name: 'Next.js & Cloud', slug: 'nextjs-cloud', description: 'Server components, edge computing, and cloud architectures.', color: '#10b981', icon: 'RocketLaunchIcon', _count: { posts: 8 } },
];

async function getCategoriesOverview() {
  const cacheKey = 'categories_overview';
  const cached = publicDataCache.get(cacheKey);
  if (cached) return cached;

  try {
    const queryPromise = (async () => {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      });

      const categoryIds = categories.map((c) => c.id);
      const postsByCategory = {};

      if (categoryIds.length > 0) {
        // Fetch up to 30 recent posts across categories to display previews
        const posts = await prisma.post.findMany({
          where: { published: true, categories: { some: { categoryId: { in: categoryIds } } } },
          orderBy: { publishedAt: 'desc' },
          take: 30,
          select: {
            id: true, 
            slug: true, 
            title: true, 
            coverImage: true, 
            readTime: true, 
            publishedAt: true,
            categories: { select: { categoryId: true } },
          },
        });

        for (const p of posts) {
          for (const c of p.categories) {
            if (!postsByCategory[c.categoryId]) postsByCategory[c.categoryId] = [];
            if (postsByCategory[c.categoryId].length < 2) {
              postsByCategory[c.categoryId].push({
                id: p.id,
                slug: p.slug,
                title: p.title,
              });
            }
          }
        }
      }

      return { categories, postsByCategory };
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Categories query timeout')), 3500)
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    publicDataCache.set(cacheKey, result, 300000); // 5 min TTL
    return result;
  } catch (err) {
    console.warn('Categories overview query delayed or failed, using fallback:', err.message);
    return {
      categories: FALLBACK_CATEGORIES,
      postsByCategory: {},
    };
  }
}

export default async function CategoriesPage() {
  const { categories, postsByCategory } = await getCategoriesOverview();

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
          const featured = postsByCategory[category.id] || [];
          return (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`} 
              className="card p-6 hover:shadow-lg transition-all duration-300 group block rounded-xl border" 
              style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <Icon className="w-6 h-6" style={{ color: category.color || 'var(--primary)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{category.name}</h3>
                    <Badge variant="secondary" className="text-xs">{category._count?.posts ?? 0} posts</Badge>
                  </div>
                </div>
              </div>
              {category.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{category.description}</p>
              )}
              {featured.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-[var(--muted-foreground)]">Featured Posts</h4>
                  {featured.map((post) => (
                    <div key={post.id} className="text-sm group-hover:text-blue-500 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{post.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="text-center rounded-2xl p-8 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          Can&apos;t find what you&apos;re looking for?
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Browse all our topics or use search to find specific technical guides
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-[var(--accent)] text-xs py-1 px-2.5">
                {category.name} ({category._count?.posts ?? 0})
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
