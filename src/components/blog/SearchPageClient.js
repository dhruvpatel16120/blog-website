"use client";

import { useState } from 'react';
import { Input, Button, Dropdown } from '@/components/ui';
import BlogGrid from '@/components/blog/BlogGrid';

export default function SearchPageClient({ allPosts = [], categories = [], tags = [], initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('relevance');

  const suggestions = query
    ? allPosts
        .filter(post =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          (post.tags && post.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  // Client-side search across available fields
  const normalizedSearch = search.trim().toLowerCase();
  let posts = normalizedSearch
    ? allPosts.filter(post => {
        const inTitle = post.title?.toLowerCase().includes(normalizedSearch);
        const inExcerpt = post.excerpt?.toLowerCase().includes(normalizedSearch);
        const inContent = post.content?.toLowerCase().includes(normalizedSearch);
        const inTags = Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(normalizedSearch));
        return inTitle || inExcerpt || inContent || inTags;
      })
    : allPosts;

  if (category) posts = posts.filter(post => post.categories && post.categories.includes(category));
  if (tag) posts = posts.filter(post => post.tags && post.tags.includes(tag));
  if (dateFrom) posts = posts.filter(post => post.date && post.date >= dateFrom);
  if (dateTo) posts = posts.filter(post => post.date && post.date <= dateTo);

  // Sorting
  if (sort === 'newest') posts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (sort === 'oldest') posts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (sort === 'title') posts = [...posts].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else if (sort === 'readTime') posts = [...posts].sort((a, b) => (b.readTime || 0) - (a.readTime || 0));
  else if (sort === 'tagMatch') {
    const q = (search || '').toLowerCase();
    posts = [...posts].sort((a, b) => {
      const aMatches = (a.tags || []).some(t => t.toLowerCase().includes(q)) ? 1 : 0;
      const bMatches = (b.tags || []).some(t => t.toLowerCase().includes(q)) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    setSearch(text);
    setShowSuggestions(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Search Blog Posts
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4 relative">
          <div className="w-full relative">
            <Input
              type="text"
              placeholder="Search by title, excerpt, tag, or content..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white dark:bg-zinc-900 border rounded shadow z-10 mt-1">
                {suggestions.map((post, idx) => (
                  <div
                    key={post.slug || post.title + idx}
                    className="px-4 py-2 cursor-pointer hover:bg-muted"
                    onClick={() => handleSuggestionClick(post.title)}
                  >
                    {post.title}
                  </div>
                ))}
                {suggestions.length < 5 && tags.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 5 - suggestions.length).map((t, idx) => (
                  <div
                    key={t + idx}
                    className="px-4 py-2 cursor-pointer hover:bg-muted"
                    onClick={() => handleSuggestionClick(t)}
                  >
                    Tag: {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit">Search</Button>
        </form>
        <div className="flex flex-wrap gap-2 mb-4">
          <Dropdown
            trigger={<span>{category || 'All Categories'}</span>}
            items={[{ label: 'All Categories', onClick: () => setCategory('') }, ...categories.map(c => ({ label: c, onClick: () => setCategory(c) }))]}
          />
          <Dropdown
            trigger={<span>{tag || 'All Tags'}</span>}
            items={[{ label: 'All Tags', onClick: () => setTag('') }, ...tags.map(t => ({ label: t, onClick: () => setTag(t) }))]}
          />
          <Dropdown
            trigger={<span>{
              sort === 'relevance' ? 'Sort: Relevance' :
              sort === 'newest' ? 'Sort: Newest' :
              sort === 'oldest' ? 'Sort: Oldest' :
              sort === 'title' ? 'Sort: Title' :
              sort === 'readTime' ? 'Sort: Read time' : 'Sort: Tag match'
            }</span>}
            items={[
              { label: 'Relevance', onClick: () => setSort('relevance') },
              { label: 'Newest', onClick: () => setSort('newest') },
              { label: 'Oldest', onClick: () => setSort('oldest') },
              { label: 'Title', onClick: () => setSort('title') },
              { label: 'Read time', onClick: () => setSort('readTime') },
              { label: 'Tag match first', onClick: () => setSort('tagMatch') },
            ]}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="To"
          />
        </div>
      </div>
      {search && posts.length === 0 ? (
        <div className="text-center text-lg text-muted-foreground py-12">
          No posts found for &quot;{search}&quot;.
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </div>
  );
}


