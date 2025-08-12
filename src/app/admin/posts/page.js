"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminPosts() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [adminSession, loading, router]);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    const controller = new AbortController();
    try {
      setLoadingPosts(true);
      setError('');
      const response = await fetch(`/api/admin/posts`, { signal: controller.signal });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch posts');
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setPosts(list);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching posts:', error);
        setError(error.message || 'Failed to fetch posts');
      }
    } finally {
      setLoadingPosts(false);
    }
    return () => controller.abort();
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete post');
      }
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Error deleting post');
    }
  };

  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.type !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Posts Management" adminSession={adminSession}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Posts ({filteredPosts.length})
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all blog posts and content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/posts/new">
            <Button className="flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts List */}
      {loadingPosts ? (
        <Card>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              {/* DocumentTextIcon is not imported, so it's commented out */}
              {/* <DocumentTextIcon className="h-12 w-12" /> */}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first post'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link href="/admin/posts/new">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.excerpt || 'No excerpt available'}
                    </p>
                    
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {post.author?.fullName || post.author?.username || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span>{post.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}