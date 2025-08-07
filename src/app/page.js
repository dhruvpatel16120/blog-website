import Layout from '@/components/layout/Layout'
import BlogGrid from '@/components/blog/BlogGrid'
import { Button, Badge } from '@/components/ui'
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
    title: 'Modern Tech Stack',
    description: 'Built with Next.js 15, React 19, and Tailwind CSS for optimal performance and developer experience.'
  },
  {
    icon: CodeBracketIcon,
    title: 'Clean Code',
    description: 'Well-structured, maintainable codebase following industry best practices and modern patterns.'
  },
  {
    icon: CpuChipIcon,
    title: 'Performance Optimized',
    description: 'Optimized for speed with server-side rendering, code splitting, and modern web technologies.'
  }
]

export default function Home() {
  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 rounded-3xl mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">🚀 Latest in Tech</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Discover the Latest in
            <span className="text-primary block">Technology & Development</span>
            </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            A modern tech blog platform built with Next.js and Tailwind CSS. 
            Explore tutorials, insights, and best practices for modern web development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Explore Posts
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Why Choose Our Platform?
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Built with modern technologies and best practices to provide the best reading experience.
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {feature.description}
              </p>
            </div>
          ))}
          </div>
        </section>

      {/* Featured Posts Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Featured Posts
          </h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Latest insights and tutorials from our tech community
            </p>
          </div>
          <Button variant="outline">
            View All Posts
          </Button>
          </div>
        
        <BlogGrid posts={featuredPosts} featured={true} />
        </section>

      {/* CTA Section */}
      <section className="rounded-2xl p-8 lg:p-12 text-center" style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)'
      }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Stay Updated with Latest Tech Trends
        </h2>
        <p className="mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Subscribe to our newsletter and never miss out on the latest tutorials, 
          insights, and best practices in web development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Subscribe Now
          </Button>
          <Button variant="outline" size="lg" style={{
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
            '&:hover': {
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)'
            }
          }}>
            Learn More
          </Button>
        </div>
      </section>
    </Layout>
  )
}
