import Layout from '@/components/layout/Layout'
import BlogGrid from '@/components/blog/BlogGrid'
import { Badge } from '@/components/ui'
import { 
  CodeBracketIcon, 
  CpuChipIcon, 
  PaintBrushIcon,
  RocketLaunchIcon,
  ServerIcon,
  LightBulbIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline'

// Mock data for categories
const categories = [
  {
    id: 'react',
    name: 'React',
    description: 'Learn React fundamentals, hooks, performance optimization, and advanced patterns.',
    icon: CodeBracketIcon,
    postCount: 15,
    color: 'blue',
    featuredPosts: [
      {
        id: 1,
        title: 'Getting Started with React 19',
        excerpt: 'Learn the latest features and improvements in React 19...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'John Doe' },
        publishedAt: '2024-01-15',
        readTime: 8,
        categories: ['React'],
        tags: ['JavaScript', 'Frontend', 'Tutorial'],
        featured: true
      },
      {
        id: 2,
        title: 'React Performance Optimization',
        excerpt: 'Advanced techniques to optimize your React applications...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Jane Smith' },
        publishedAt: '2024-01-10',
        readTime: 12,
        categories: ['React'],
        tags: ['Performance', 'Optimization'],
        featured: false
      }
    ]
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Master Next.js 15 with App Router, Server Components, and modern web development.',
    icon: RocketLaunchIcon,
    postCount: 12,
    color: 'green',
    featuredPosts: [
      {
        id: 3,
        title: 'Next.js 15 App Router Deep Dive',
        excerpt: 'Explore the new App Router architecture and its benefits...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Mike Johnson' },
        publishedAt: '2024-01-08',
        readTime: 10,
        categories: ['Next.js'],
        tags: ['Full-Stack', 'Routing'],
        featured: true
      }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Type-safe JavaScript development with TypeScript best practices.',
    icon: CpuChipIcon,
    postCount: 8,
    color: 'purple',
    featuredPosts: [
      {
        id: 4,
        title: 'TypeScript Best Practices',
        excerpt: 'Essential patterns and practices for TypeScript development...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Sarah Wilson' },
        publishedAt: '2024-01-05',
        readTime: 15,
        categories: ['TypeScript'],
        tags: ['Type Safety', 'Best Practices'],
        featured: false
      }
    ]
  },
  {
    id: 'css',
    name: 'CSS & Design',
    description: 'Modern CSS techniques, Tailwind CSS, and UI/UX design principles.',
    icon: PaintBrushIcon,
    postCount: 10,
    color: 'cyan',
    featuredPosts: [
      {
        id: 5,
        title: 'Mastering Tailwind CSS',
        excerpt: 'A comprehensive guide to building beautiful UIs with Tailwind...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Alex Brown' },
        publishedAt: '2024-01-03',
        readTime: 9,
        categories: ['CSS', 'Design'],
        tags: ['Tailwind', 'Styling', 'UI/UX'],
        featured: true
      }
    ]
  },
  {
    id: 'nodejs',
    name: 'Node.js & Backend',
    description: 'Server-side development with Node.js, Express, and backend technologies.',
    icon: ServerIcon,
    postCount: 6,
    color: 'yellow',
    featuredPosts: [
      {
        id: 6,
        title: 'Building APIs with Node.js',
        excerpt: 'Learn to build scalable REST APIs using Node.js and Express...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Chris Davis' },
        publishedAt: '2024-01-01',
        readTime: 11,
        categories: ['Node.js', 'Backend'],
        tags: ['API', 'Express', 'JavaScript'],
        featured: false
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Web performance optimization, Core Web Vitals, and speed improvements.',
    icon: LightBulbIcon,
    postCount: 7,
    color: 'orange',
    featuredPosts: [
      {
        id: 7,
        title: 'Web Performance Optimization',
        excerpt: 'Techniques to improve your website performance and user experience...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Emma Wilson' },
        publishedAt: '2023-12-28',
        readTime: 13,
        categories: ['Performance'],
        tags: ['Optimization', 'Core Web Vitals'],
        featured: true
      }
    ]
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'General web development topics, tools, and modern development practices.',
    icon: GlobeAltIcon,
    postCount: 20,
    color: 'indigo',
    featuredPosts: [
      {
        id: 8,
        title: 'Modern Web Development Tools',
        excerpt: 'Essential tools and technologies for modern web development...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'David Lee' },
        publishedAt: '2023-12-25',
        readTime: 8,
        categories: ['Web Development'],
        tags: ['Tools', 'Development'],
        featured: false
      }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Deployment',
    description: 'CI/CD pipelines, deployment strategies, and infrastructure management.',
    icon: CogIcon,
    postCount: 5,
    color: 'red',
    featuredPosts: [
      {
        id: 9,
        title: 'Deploying Next.js to Production',
        excerpt: 'Best practices for deploying Next.js applications to production...',
        content: 'Full content here...',
        coverImage: '/api/placeholder/600/400',
        author: { name: 'Lisa Chen' },
        publishedAt: '2023-12-20',
        readTime: 10,
        categories: ['DevOps', 'Deployment'],
        tags: ['Vercel', 'Production', 'Deployment'],
        featured: true
      }
    ]
  }
]

export default function CategoriesPage() {
  return (
    <Layout showSidebar={true}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Categories</h1>
        <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>
          Explore our content by category and discover topics that interest you
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {categories.map((category) => (
          <div
            key={category.id}
            className="card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${category.color}-100 dark:bg-${category.color}-900/20`}>
                  <category.icon className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.postCount} posts
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              {category.description}
            </p>

            {category.featuredPosts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Featured Posts
                </h4>
                {category.featuredPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="text-sm group-hover:text-primary transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                      {post.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Featured Category - React */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Featured: React Development
            </h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Latest insights and tutorials for React developers
            </p>
          </div>
          <Badge variant="outline" className="cursor-pointer">
            View All React Posts
          </Badge>
        </div>
        
        <BlogGrid posts={(categories.find(c => c.id === 'react')?.featuredPosts || []).map(post => ({
          ...post,
          slug: `react-${post.id || post.title}`
        }))} />
      </div>

      {/* All Categories Summary */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Can't find what you're looking for?
        </h2>
        <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Browse all our categories or use the search function to find specific content
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Badge key={category.id} variant="outline" className="cursor-pointer hover:bg-muted">
              {category.name} ({category.postCount})
            </Badge>
          ))}
        </div>
      </div>
    </Layout>
  )
} 