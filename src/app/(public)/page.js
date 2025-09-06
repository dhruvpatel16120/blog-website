import BlogGrid from '@/components/blog/BlogGrid'
import { Button, Badge } from '@/components/ui'
import { prisma } from '@/lib/db'
import { 
  ArrowRightIcon, 
  RocketLaunchIcon,
  CodeBracketIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: RocketLaunchIcon,
    title: 'Latest Tech Trends',
    description: 'Stay updated with the newest technologies, frameworks, and development practices in the ever-evolving world of web development.'
  },
  {
    icon: CodeBracketIcon,
    title: 'Practical Tutorials',
    description: 'Learn by doing with hands-on tutorials, code examples, and real-world projects that you can implement in your own work.'
  },
  {
    icon: CpuChipIcon,
    title: 'Expert Insights',
    description: 'Get insights from experienced developers and industry experts who share their knowledge and best practices.'
  }
]

export default async function Home() {
  const [featured, trending, latest, counts, topCategories] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true,
        readTime: true, publishedAt: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } }
      }
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true,
        readTime: true, publishedAt: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } }
      }
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 9,
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true,
        readTime: true, publishedAt: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } }
      }
    }),
    Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.tag.count(),
    ]),
    prisma.category.findMany({
      where: { posts: { some: { post: { published: true } } } },
      orderBy: { name: 'asc' },
      take: 12,
      select: { name: true, slug: true, _count: { select: { posts: true } } }
    })
  ]);

  const normalize = (arr) => arr.map(p => ({
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
  }));

  const featuredNormalized = normalize(featured);
  const trendingNormalized = normalize(trending);
  const latestNormalized = normalize(latest);
  const [postCount, commentCount, userCount, tagCount] = counts;

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Welcome to TechBlog</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Your Gateway to
            <span className="text-primary block">Modern Web Development</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Discover the latest in technology, programming tutorials, and digital innovation. 
            Stay ahead with our expert insights and practical guides.
          </p>
          <form className="max-w-2xl mx-auto mb-6" action="/blog" method="GET">
            <div className="flex gap-2">
              <input
                name="search"
                placeholder="Search articles, topics, or tags..."
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--card)] text-[var(--foreground)]"
              />
              <Button as="button" type="submit" variant="outline">Search</Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2 justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <span>{postCount} posts</span>
            <span>·</span>
            <span>{commentCount} comments</span>
            <span>·</span>
            <span>{tagCount} tags</span>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Articles</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Handpicked content for developers</p>
          </div>
          <Button as="a" href="/blog" variant="outline" className="hidden sm:flex">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <BlogGrid posts={featuredNormalized} />
        <div className="text-center mt-8 sm:hidden">
          <Button as="a" href="/blog" variant="outline">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Most viewed articles this week</p>
          </div>
        </div>
        <BlogGrid posts={trendingNormalized} />
      </section>

      {/* Explore Topics */}
      <section className="mb-16">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Topics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Browse popular categories</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {topCategories.map((c) => (
            <a
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="px-4 py-2 rounded-full border text-sm hover:bg-primary hover:text-white transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              {c.name} ({c._count.posts})
            </a>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose TechBlog?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We provide comprehensive resources to help you master modern web development
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Posts</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Fresh content from our team</p>
          </div>
          <Button as="a" href="/blog" variant="outline" className="hidden sm:flex">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <BlogGrid posts={latestNormalized} />
        <div className="text-center mt-8 sm:hidden">
          <Button as="a" href="/blog" variant="outline">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center rounded-2xl p-8 lg:p-12 border" style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)'
      }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Ready to Level Up Your Skills?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Join thousands of developers learning and growing with TechBlog. 
          Follow us for the latest insights and updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as="a" href="/contribute" size="lg" className="bg-primary hover:bg-blue-700 text-primary-foreground">
            Join Our Community
          </Button>
          <Button as="a" href="https://twitter.com/techblog" target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Follow Us on Twitter
          </Button>
        </div>
      </section>
    </>
  )
}
