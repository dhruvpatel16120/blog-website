"use client"

import Layout from '@/components/layout/Layout'
import BlogGrid from '@/components/blog/BlogGrid'
import { Button, Input, Badge, Dropdown } from '@/components/ui'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

// Mock data for demonstration
const allPosts = [
  {
    id: 1,
    title: 'Getting Started with Next.js 15: A Complete Guide',
    excerpt: 'Learn how to build modern web applications with Next.js 15, including the new App Router, Server Components, and advanced features.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'John Doe' },
    publishedAt: '2024-01-15',
    readTime: 8,
    categories: ['Next.js', 'React'],
    tags: ['JavaScript', 'Web Development', 'Tutorial'],
    featured: true
  },
  {
    id: 2,
    title: 'Mastering Tailwind CSS: From Basics to Advanced',
    excerpt: 'A comprehensive guide to building beautiful, responsive user interfaces with Tailwind CSS.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'Jane Smith' },
    publishedAt: '2024-01-10',
    readTime: 12,
    categories: ['CSS', 'Design'],
    tags: ['Tailwind', 'Styling', 'UI/UX'],
    featured: false
  },
  {
    id: 3,
    title: 'TypeScript Best Practices for React Developers',
    excerpt: 'Discover the best practices for using TypeScript with React to build more robust and maintainable applications.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'Mike Johnson' },
    publishedAt: '2024-01-08',
    readTime: 10,
    categories: ['TypeScript', 'React'],
    tags: ['JavaScript', 'Programming', 'Best Practices'],
    featured: false
  },
  {
    id: 4,
    title: 'Building Scalable APIs with Node.js and Express',
    excerpt: 'Learn how to design and build scalable REST APIs using Node.js, Express, and modern development practices.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'Sarah Wilson' },
    publishedAt: '2024-01-05',
    readTime: 15,
    categories: ['Node.js', 'Backend'],
    tags: ['API', 'Express', 'JavaScript'],
    featured: false
  },
  {
    id: 5,
    title: 'Advanced CSS Grid Layout Techniques',
    excerpt: 'Master CSS Grid Layout with advanced techniques for creating complex, responsive layouts.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'Alex Brown' },
    publishedAt: '2024-01-03',
    readTime: 9,
    categories: ['CSS', 'Design'],
    tags: ['Grid', 'Layout', 'Responsive'],
    featured: false
  },
  {
    id: 6,
    title: 'React Performance Optimization Strategies',
    excerpt: 'Learn advanced techniques to optimize React applications for better performance and user experience.',
    content: 'Full content here...',
    coverImage: '/api/placeholder/600/400',
    author: { name: 'Chris Davis' },
    publishedAt: '2024-01-01',
    readTime: 11,
    categories: ['React', 'Performance'],
    tags: ['Optimization', 'Performance', 'React'],
    featured: false
  }
]

const categories = [
  'All Categories',
  'React',
  'Next.js',
  'TypeScript',
  'CSS',
  'Node.js',
  'Performance',
  'Design'
]

export default function BlogPage() {
  return (
    <Layout showSidebar={true}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blog</h1>
        <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>
          Discover insights, tutorials, and best practices in modern web development
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Dropdown
              trigger={
                <>
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filter</span>
                </>
              }
              items={[
                { label: 'Latest', onClick: () => console.log('Latest') },
                { label: 'Most Popular', onClick: () => console.log('Popular') },
                { label: 'Featured', onClick: () => console.log('Featured') }
              ]}
            />

            <Dropdown
              trigger={
                <span>All Categories</span>
              }
              items={categories.map(category => ({
                label: category,
                onClick: () => console.log(category)
              }))}
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="mb-6">
                 <div className="flex flex-wrap gap-2">
           <Badge variant="secondary" className="cursor-pointer" style={{
             '&:hover': { backgroundColor: 'var(--muted)' }
           }}>
             All Categories
             <span className="ml-1">×</span>
           </Badge>
           <Badge variant="secondary" className="cursor-pointer" style={{
             '&:hover': { backgroundColor: 'var(--muted)' }
           }}>
             Latest
             <span className="ml-1">×</span>
           </Badge>
         </div>
      </div>

      {/* Blog Grid */}
      <BlogGrid posts={allPosts} />

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
                     <span className="px-3" style={{ color: 'var(--muted-foreground)' }}>...</span>
          <Button variant="outline" size="sm">10</Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </Layout>
  )
} 