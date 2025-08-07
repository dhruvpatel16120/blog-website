"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button, Input, Badge } from '@/components/ui'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import { useRouter } from 'next/navigation';

const Sidebar = ({ allPosts = [] }) => {
  const [email, setEmail] = useState('')
  const router = useRouter();

  // Real data for widgets
  const recentPosts = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  // Mock data - replace with real data
  const author = {
    name: 'John Doe',
    avatar: '/api/placeholder/80/80',
    bio: 'Full-stack developer passionate about modern web technologies and clean code.',
    social: {
      twitter: '#',
      github: '#',
      linkedin: '#'
    }
  }

  const categories = [
    { name: 'React', count: 15, color: 'blue' },
    { name: 'Next.js', count: 12, color: 'green' },
    { name: 'TypeScript', count: 8, color: 'purple' },
    { name: 'Tailwind CSS', count: 10, color: 'cyan' },
    { name: 'JavaScript', count: 20, color: 'yellow' },
    { name: 'Web Development', count: 25, color: 'indigo' }
  ]

  const tags = [
    'React', 'Next.js', 'TypeScript', 'Tailwind', 'JavaScript', 'CSS', 'HTML', 'Node.js'
  ]

  // Category/Tag Cloud
  const categorySet = new Set();
  const tagSet = new Set();
  allPosts.forEach(post => {
    (post.categories || []).forEach(c => categorySet.add(c));
    (post.tags || []).forEach(t => tagSet.add(t));
  });
  const allCategories = Array.from(categorySet);
  const allTags = Array.from(tagSet);

  const handleNewsletterSignup = (e) => {
    e.preventDefault()
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <aside className="space-y-8">
      {/* Author Information */}
      <div className="card p-6" style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}>
        <div className="text-center">
                     <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
             backgroundColor: 'var(--muted)'
           }}>
             <span className="text-2xl font-bold" style={{ color: 'var(--muted-foreground)' }}>
               {author.name.split(' ').map(n => n[0]).join('')}
             </span>
           </div>
                               <h3 className="text-lg font-semibold mb-2 text-foreground">{author.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{author.bio}</p>
          <div className="flex justify-center space-x-3">
                         {Object.entries(author.social).map(([platform, url]) => (
               <a
                 key={platform}
                 href={url}
                 className="transition-colors text-muted-foreground hover:text-foreground"
                 aria-label={platform}
               >
                 <span className="capitalize text-sm">{platform}</span>
               </a>
             ))}
          </div>
        </div>
      </div>

             {/* Newsletter Signup */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-3 text-foreground">Subscribe to Newsletter</h3>
         <p className="text-muted-foreground text-sm mb-4">
           Get the latest posts and updates delivered to your inbox.
         </p>
        <form onSubmit={handleNewsletterSignup} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Subscribe
          </Button>
        </form>
      </div>

             {/* Popular Posts Widget */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-2">Popular Posts</h3>
        <ul className="space-y-2">
          {popularPosts.map(post => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
              <div className="text-xs text-muted-foreground">
                {formatDate(post.date)}
              </div>
            </li>
          ))}
        </ul>
      </div>

             {/* Recent Posts Widget */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-2">Recent Posts</h3>
        <ul className="space-y-2">
          {recentPosts.map(post => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
              <div className="text-xs text-muted-foreground">
                {formatDate(post.date)}
              </div>
            </li>
          ))}
        </ul>
      </div>

             {/* Categories */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-4 text-foreground">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
                         <Link
               key={category.name}
               href={`/categories/${category.name.toLowerCase()}`}
               className="flex items-center justify-between p-2 rounded-md transition-colors group"
               style={{ 
                 '&:hover': { backgroundColor: 'var(--muted)' }
               }}
             >
               <span className="text-muted-foreground group-hover:text-foreground">
                 {category.name}
               </span>
               <Badge variant="secondary" className="text-xs">
                 {category.count}
               </Badge>
             </Link>
          ))}
        </div>
      </div>

             {/* Tags */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-4 text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-2">
                     {tags.map((tag) => (
             <Link key={tag} href={`/tags/${tag.toLowerCase()}`}>
               <Badge variant="outline" className="transition-colors cursor-pointer" style={{
                 '&:hover': { backgroundColor: 'var(--muted)' }
               }}>
                 {tag}
               </Badge>
             </Link>
           ))}
        </div>
      </div>

             {/* Category Cloud */}
      <div>
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(cat => (
            <Badge
              key={cat}
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push(`/categories/${cat.toLowerCase()}`)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>
      {/* Tag Cloud */}
      <div>
        <h3 className="font-semibold mb-2 mt-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => router.push(`/tags/${tag.toLowerCase()}`)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

             {/* Search */}
       <div className="card p-6" style={{
         backgroundColor: 'var(--card)',
         borderColor: 'var(--border)'
       }}>
         <h3 className="text-lg font-semibold mb-4 text-foreground">Search</h3>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search posts..."
            className="pr-10"
          />
                     <button className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{
             color: 'var(--muted-foreground)',
             '&:hover': { color: 'var(--foreground)' }
           }}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar 