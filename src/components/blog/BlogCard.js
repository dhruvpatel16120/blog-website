import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardContent, Badge } from '@/components/ui'
import { formatDate, calculateReadingTime, generateExcerpt } from '@/lib/utils'
import { cn } from '@/lib/utils'

const BlogCard = ({ post, variant = 'default' }) => {
  const {
    id,
    title,
    excerpt,
    content,
    coverImage,
    author,
    date,
    readTime,
    categories = [],
    tags = [],
    featured = false,
    commentCount = 0
  } = post

  const variants = {
    default: 'h-full',
    featured: 'lg:col-span-2',
    compact: 'h-auto'
  }

  const cardClasses = cn(
    'group transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    variants[variant]
  )

  return (
    <Card className={cardClasses}>
      <Link href={`/blog/${post.slug || id}`} className="block h-full">
        {/* Cover Image */}
        {coverImage && (
          <div className="relative h-48 lg:h-64 overflow-hidden rounded-t-lg">
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {featured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-white">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardHeader className="pb-3">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.slice(0, 2).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

                     {/* Title */}
           <h3 className="text-xl font-bold group-hover:text-primary transition-colors overflow-hidden" style={{ color: 'var(--foreground)' }}>
             <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
               {title}
             </span>
           </h3>
        </CardHeader>

        <CardContent className="pt-0">
                     {/* Excerpt */}
           <p className="mb-4 overflow-hidden" style={{ color: 'var(--muted-foreground)' }}>
             <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
               {excerpt || generateExcerpt(content, 120)}
             </span>
           </p>

          {/* Author and Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                             {/* Author Avatar */}
               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                 backgroundColor: 'var(--muted)'
               }}>
                 <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                   {author?.name?.charAt(0) || 'A'}
                 </span>
               </div>
              
              {/* Author Info */}
                             <div className="text-sm">
                 <p className="font-medium" style={{ color: 'var(--foreground)' }}>{author?.name || author || 'Anonymous'}</p>
                 <p style={{ color: 'var(--muted-foreground)' }}>{formatDate(date)}</p>
               </div>
            </div>

                         {/* Reading Time and Comments */}
             <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
               <div>{readTime || calculateReadingTime(content)} min read</div>
               <div>{commentCount} comments</div>
             </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
                             {tags.length > 3 && (
                 <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{tags.length - 3} more</span>
               )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

export default BlogCard 