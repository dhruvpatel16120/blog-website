import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { Input, Button, Dropdown } from '@/components/ui';
import { searchPosts, getAllPosts } from '@/lib/posts';

// Helper to get all unique categories and tags
function getAllCategoriesAndTags() {
  const all = getAllPosts({ page: 1, limit: 1000 }).posts;
  const categories = Array.from(new Set(all.flatMap(post => post.categories || [])));
  const tags = Array.from(new Set(all.flatMap(post => post.tags || [])));
  return { categories, tags };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { categories, tags } = getAllCategoriesAndTags();
  const allPosts = getAllPosts({ page: 1, limit: 1000 }).posts;

  // Suggestions: match titles and tags
  const suggestions = query
    ? allPosts
        .filter(post =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          (post.tags && post.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  // Filtered posts
  let posts = search ? searchPosts(search) : allPosts;
  if (category) posts = posts.filter(post => post.categories && post.categories.includes(category));
  if (tag) posts = posts.filter(post => post.tags && post.tags.includes(tag));
  if (dateFrom) posts = posts.filter(post => post.date && post.date >= dateFrom);
  if (dateTo) posts = posts.filter(post => post.date && post.date <= dateTo);

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
    <Layout showSidebar={true}>
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
          No posts found for "{search}".
        </div>
      ) : (
        <BlogGrid posts={posts} />
      )}
    </Layout>
  );
}