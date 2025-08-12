"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Input, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, ClockIcon, FireIcon, TagIcon } from '@heroicons/react/24/outline'


const Sidebar = ({ allPosts = [], categories = [], tags = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter();

  // Real data for widgets
  const recentPosts = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  // Category/Tag Cloud: prefer server-provided lists; fallback to derive from posts
  const fallbackCategorySet = new Set();
  const fallbackTagSet = new Set();
  allPosts.forEach(post => {
    (post.categories || []).forEach(c => fallbackCategorySet.add(c));
    (post.tags || []).forEach(t => fallbackTagSet.add(t));
  });
  const allCategories = categories.length > 0 ? categories : Array.from(fallbackCategorySet).map(name => ({ name, slug: name.toLowerCase().replace(/ /g, '-') }));
  const allTags = tags.length > 0 ? tags : Array.from(fallbackTagSet).map(name => ({ name, slug: name.toLowerCase().replace(/ /g, '-') }));


  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <aside className="space-y-8 sticky top-24">
      {/* Search Widget */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
              }}
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ClockIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>Recent Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{new Date(post.date).toISOString().split('T')[0]}</span>
                      {post.readingTime && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{post.readingTime} min read</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Posts Widget */}
      {popularPosts.length > 0 && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FireIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>Popular Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {popularPosts.map((post, index) => (
                <div key={index} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{post.views || 0} views</span>
                      {post.readingTime && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{post.readingTime} min read</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Widget */}
      {allCategories.length > 0 && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TagIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((c, index) => {
                const name = typeof c === 'string' ? c : c.name;
                const slug = typeof c === 'string' ? c.toLowerCase().replace(/ /g, '-') : c.slug;
                const count = typeof c === 'string' ? undefined : c.count;
                return (
                  <Link key={index} href={`/categories/${slug}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {name}{typeof count === 'number' ? ` (${count})` : ''}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Cloud Widget */}
      {allTags.length > 0 && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TagIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span>Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {allTags.map((t, index) => {
                const name = typeof t === 'string' ? t : t.name;
                const slug = typeof t === 'string' ? t.toLowerCase().replace(/ /g, '-') : t.slug;
                const count = typeof t === 'string' ? undefined : t.count;
                return (
                  <Link key={index} href={`/tags/${slug}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {name}{typeof count === 'number' ? ` (${count})` : ''}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </aside>
  );
}

export default Sidebar;