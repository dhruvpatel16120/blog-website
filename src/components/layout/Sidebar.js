"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, ClockIcon, FireIcon, TagIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Sidebar({ allPosts = [], categories = [], tags = [], settings = {} }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Ensure allPosts is always an array (memoized)
  const postsList = useMemo(() => (Array.isArray(allPosts) ? allPosts : []), [allPosts])

  // Recent posts sorted by date (memoized to avoid re-sorting on search input typing)
  const recentPosts = useMemo(() => {
    return [...postsList]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 4)
  }, [postsList])

  // Popular posts sorted based on LIKES
  const popularPosts = useMemo(() => {
    return [...postsList]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 4)
  }, [postsList])

  // Limits from admin settings
  const categoriesLimit = Number(settings?.categoriesCount) || 6
  const tagsLimit = Number(settings?.tagsCount) || 12

  // Category & Tag Cloud: prefer server-provided lists; fallback to derive from posts
  const { displayCategories, displayTags } = useMemo(() => {
    const fallbackCategorySet = new Set()
    const fallbackTagSet = new Set()
    postsList.forEach((post) => {
      if (post && Array.isArray(post.categories)) {
        post.categories.forEach((c) => {
          if (c) fallbackCategorySet.add(typeof c === 'object' ? (c.name || c.slug) : c)
        })
      }
      if (post && Array.isArray(post.tags)) {
        post.tags.forEach((t) => {
          if (t) fallbackTagSet.add(typeof t === 'object' ? (t.name || t.slug) : t)
        })
      }
    })

    const rawCategories = Array.isArray(categories) && categories.length > 0
      ? categories
      : Array.from(fallbackCategorySet).map((name) => ({ name: String(name), slug: String(name).toLowerCase().replace(/ /g, '-') }))

    const rawTags = Array.isArray(tags) && tags.length > 0
      ? tags
      : Array.from(fallbackTagSet).map((name) => ({ name: String(name), slug: String(name).toLowerCase().replace(/ /g, '-') }))

    return {
      displayCategories: rawCategories.slice(0, categoriesLimit),
      displayTags: rawTags.slice(0, tagsLimit),
    }
  }, [postsList, categories, tags, categoriesLimit, tagsLimit])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <aside className="space-y-6 sticky top-24">
      {/* Search Widget */}
      <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-base font-semibold text-[var(--foreground)]">Search Articles</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search topics, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-sm bg-[var(--background)] border-[var(--input)] text-[var(--foreground)]"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[var(--muted-foreground)] hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-[var(--border)]">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[var(--foreground)]">
              <ClockIcon className="w-4 h-4 text-indigo-500" />
              <span>Recent Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-5 sm:pt-6">
            <div className="divide-y divide-[var(--border)]">
              {recentPosts.map((post, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0 group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-[11px] text-[var(--muted-foreground)] gap-2">
                      <span>{post.date ? new Date(post.date).toISOString().split('T')[0] : 'Recent'}</span>
                      {post.readingTime && (
                        <>
                          <span>•</span>
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

      {/* Popular Posts Widget (Sorted by Likes) */}
      {popularPosts.length > 0 && (
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-[var(--border)]">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[var(--foreground)]">
              <FireIcon className="w-4 h-4 text-rose-500" />
              <span>Popular Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-5 sm:pt-6">
            <div className="divide-y divide-[var(--border)]">
              {popularPosts.map((post, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0 group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--foreground)] group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-[11px] text-[var(--muted-foreground)] gap-2">
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                        <HeartIcon className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500" />
                        <span>{post.likesCount || 0}</span>
                      </span>
                      <span>•</span>
                      <span>{post.views || 0} views</span>
                      {post.readingTime && (
                        <>
                          <span>•</span>
                          <span>{post.readingTime} min</span>
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
      {displayCategories.length > 0 && (
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-[var(--foreground)]">
                <TagIcon className="w-4 h-4 text-blue-500" />
                <span>Categories</span>
              </CardTitle>
              <Link href="/categories" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-5 sm:pt-6">
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((c, index) => {
                const name = typeof c === 'string' ? c : c.name
                const slug = typeof c === 'string' ? c.toLowerCase().replace(/ /g, '-') : c.slug
                const count = typeof c === 'string' ? undefined : c.count
                return (
                  <Link key={index} href={`/categories/${slug}`}>
                    <Badge variant="secondary" className="text-xs hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer py-1.5 px-3">
                      {name}{typeof count === 'number' ? ` (${count})` : ''}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Cloud Widget */}
      {displayTags.length > 0 && (
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-[var(--border)]">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[var(--foreground)]">
              <TagIcon className="w-4 h-4 text-purple-500" />
              <span>Popular Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-5 sm:pt-6">
            <div className="flex flex-wrap gap-2">
              {displayTags.map((t, index) => {
                const name = typeof t === 'string' ? t : t.name
                const slug = typeof t === 'string' ? t.toLowerCase().replace(/ /g, '-') : t.slug
                const count = typeof t === 'string' ? undefined : t.count
                return (
                  <Link key={index} href={`/tags/${slug}`}>
                    <Badge variant="secondary" className="text-xs hover:bg-purple-600 hover:text-white transition-colors cursor-pointer py-1.5 px-3">
                      #{name}{typeof count === 'number' ? ` (${count})` : ''}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
