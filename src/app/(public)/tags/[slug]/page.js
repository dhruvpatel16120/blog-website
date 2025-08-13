import BlogGrid from '@/components/blog/BlogGrid'
import { Button, Badge } from '@/components/ui'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function TagPage({ params, searchParams }) {
  const p = await params
  const sp = await searchParams

  const slug = p.slug
  const page = Math.max(parseInt(sp?.page || '1', 10), 1)
  const limit = 9

  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, color: true, _count: { select: { posts: true } } }
  })

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold mb-2">Tag not found</h1>
        <p className="text-gray-600 dark:text-gray-400">The tag you are looking for does not exist.</p>
      </div>
    )
  }

  const where = {
    published: true,
    tags: { some: { tag: { slug } } },
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true,
        readTime: true, publishedAt: true,
        categories: { include: { category: { select: { name: true } } } },
        tags: { include: { tag: { select: { name: true } } } },
        author: { select: { fullName: true, username: true } }
      }
    })
  ])

  const totalPages = Math.max(Math.ceil(total / limit), 1)

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
  }))

  const normalized = normalize(posts)

  const generatePaginationRange = (currentPage, totalPages) => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    rangeWithDots.push(...range)
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }
    return rangeWithDots
  }

  const paginationRange = generatePaginationRange(page, totalPages)

  const buildUrl = (newParams) => {
    const params = new URLSearchParams()
    const current = {
      page: String(page),
    }
    const merged = { ...current, ...Object.fromEntries(Object.entries(newParams).map(([k, v]) => [k, v == null ? '' : String(v)])) }
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    const query = params.toString()
    return query ? `?${query}` : '?'
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <Badge className="mb-3">Tag</Badge>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>#{tag.name}</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>{total} post{total !== 1 ? 's' : ''}</p>
      </div>

      <BlogGrid posts={normalized} />

      {totalPages > 1 && (
        <div className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex items-center space-x-1">
              <Button as="a" href={buildUrl({ page: 1 })} variant="outline" size="sm" disabled={page <= 1} className="px-2">First</Button>
              <Button as="a" href={buildUrl({ page: page - 1 })} variant="outline" size="sm" disabled={page <= 1} className="px-2">Prev</Button>
              {paginationRange.map((n, idx) => (
                n === '...'
                  ? <span key={`dots-${idx}`} className="px-3 py-2 text-gray-500">...</span>
                  : (
                    <Button
                      key={n}
                      as="a"
                      href={buildUrl({ page: n })}
                      size="sm"
                      variant={page === n ? undefined : 'outline'}
                      className="px-3"
                    >{n}</Button>
                  )
              ))}
              <Button as="a" href={buildUrl({ page: page + 1 })} variant="outline" size="sm" disabled={page >= totalPages} className="px-2">Next</Button>
              <Button as="a" href={buildUrl({ page: totalPages })} variant="outline" size="sm" disabled={page >= totalPages} className="px-2">Last</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


