import Layout from '@/components/layout/Layout';
import { getAllPosts } from '@/lib/posts';
import SearchPageClient from '@/components/blog/SearchPageClient';

export default function SearchPage() {
  // Server: read posts from filesystem
  const allPosts = getAllPosts({ page: 1, limit: 1000 }).posts;
  const categories = Array.from(new Set(allPosts.flatMap(post => post.categories || [])));
  const tags = Array.from(new Set(allPosts.flatMap(post => post.tags || [])));

  return (
    <Layout showSidebar={true}>
      <SearchPageClient allPosts={allPosts} categories={categories} tags={tags} />
    </Layout>
  );
}