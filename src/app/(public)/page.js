import BlogGrid from '@/components/blog/BlogGrid'
import { Button, Badge } from '@/components/ui'
import { prisma } from '@/lib/db'
import { 
  ArrowRightIcon, 
  RocketLaunchIcon,
  CodeBracketIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

// Comprehensive fake data for demonstration
const featuredPosts = [
  {
    id: 1,
    slug: 'getting-started-nextjs-15',
    title: 'Getting Started with Next.js 15: A Complete Guide',
    excerpt: 'Learn how to build modern web applications with Next.js 15, including the new App Router, Server Components, and advanced features that will revolutionize your development workflow.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    author: 'John Doe',
    date: '2024-06-15',
    readTime: 8,
    categories: ['Next.js', 'React'],
    tags: ['JavaScript', 'Web Development', 'Tutorial', 'Frontend'],
    featured: true
  },
  {
    id: 2,
    slug: 'mastering-tailwind-css',
    title: 'Mastering Tailwind CSS: From Basics to Advanced',
    excerpt: 'A comprehensive guide to building beautiful, responsive user interfaces with Tailwind CSS. Learn utility-first CSS and create stunning designs efficiently.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    author: 'Jane Smith',
    date: '2024-06-10',
    readTime: 12,
    categories: ['CSS', 'Design'],
    tags: ['Tailwind', 'Styling', 'UI/UX', 'CSS'],
    featured: false
  },
  {
    id: 3,
    slug: 'typescript-react-best-practices',
    title: 'TypeScript Best Practices for React Developers',
    excerpt: 'Discover the best practices for using TypeScript with React to build more robust and maintainable applications. Learn type safety and advanced patterns.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80',
    author: 'Mike Johnson',
    date: '2024-06-08',
    readTime: 10,
    categories: ['TypeScript', 'React'],
    tags: ['JavaScript', 'Programming', 'Best Practices', 'TypeScript'],
    featured: false
  },
  {
    id: 4,
    slug: 'modern-javascript-features',
    title: 'Modern JavaScript Features You Should Know',
    excerpt: 'Explore the latest JavaScript features including ES2023 updates, async/await patterns, and modern syntax that will make your code cleaner and more efficient.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
    author: 'Sarah Wilson',
    date: '2024-06-05',
    readTime: 15,
    categories: ['JavaScript', 'Programming'],
    tags: ['JavaScript', 'ES6', 'Modern Features', 'Programming'],
    featured: true
  },
  {
    id: 5,
    slug: 'web-performance-optimization',
    title: 'Web Performance Optimization: A Complete Guide',
    excerpt: 'Learn how to optimize your web applications for speed and performance. From Core Web Vitals to advanced caching strategies.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    author: 'Alex Chen',
    date: '2024-06-03',
    readTime: 18,
    categories: ['Performance', 'Web Development'],
    tags: ['Performance', 'Optimization', 'Core Web Vitals', 'Speed'],
    featured: false
  },
  {
    id: 6,
    slug: 'docker-for-developers',
    title: 'Docker for Developers: Containerization Made Simple',
    excerpt: 'Master Docker containerization for your development workflow. Learn how to containerize applications and streamline your deployment process.',
    content: 'Full content here...',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=600&q=80',
    author: 'David Brown',
    date: '2024-06-01',
    readTime: 14,
    categories: ['DevOps', 'Docker'],
    tags: ['Docker', 'Containerization', 'DevOps', 'Deployment'],
    featured: false
  }
]

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
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 12,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      readTime: true,
      publishedAt: true,
      categories: { include: { category: { select: { name: true } } } },
      tags: { include: { tag: { select: { name: true } } } },
      author: { select: { fullName: true, username: true } }
    }
  });
  const normalized = posts.map(p => ({
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Explore Articles
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              Subscribe to Newsletter
            </Button>
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
          <Button variant="outline" className="hidden sm:flex">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <BlogGrid posts={featuredPosts} />
        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
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
          <Button variant="outline" className="hidden sm:flex">
            View All Posts
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <BlogGrid posts={normalized.slice(0, 6)} />
        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline">
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
          Join thousands of developers who are already learning and growing with TechBlog. 
          Get the latest insights delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-blue-700 text-primary-foreground">
            Subscribe to Newsletter
          </Button>
          <Button variant="outline" size="lg" className="border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Follow Us on Twitter
          </Button>
        </div>
      </section>
    </>
  )
}
