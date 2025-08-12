import BlogCard from './BlogCard'
import { CardSkeleton } from '@/components/ui'

const BlogGrid = ({ posts = [], loading = false, featured = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600">Check back later for new content!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <BlogCard
          key={post.slug}
          post={post}
          variant={featured && index === 0 ? 'featured' : 'default'}
        />
      ))}
    </div>
  )
}

export default BlogGrid 