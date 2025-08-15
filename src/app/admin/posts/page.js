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
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  StarIcon
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
  const [summary, setSummary] = useState({ total: 0, published: 0, draft: 0, featured: 0, scheduled: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    const controller = new AbortController();
    try {
      setLoadingPosts(true);
      setError('');
      const response = await fetch(`/api/admin/posts?page=${page}&limit=${pageSize}`, { signal: controller.signal });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch posts');
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setPosts(list);
      
      // Calculate summary
      const total = list.length;
      const published = list.filter(p => p.status === 'published').length;
      const draft = list.filter(p => p.status === 'draft').length;
      const featured = list.filter(p => p.featured).length;
      const scheduled = list.filter(p => p.status === 'draft' && p.publishedAt && new Date(p.publishedAt) > new Date()).length;
      
      setSummary({ total, published, draft, featured, scheduled });
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
    setConfirmDeleteId(postId);
    setConfirmError('');
  };

  const doDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      const response = await fetch(`/api/admin/posts/${confirmDeleteId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete post');
      }
      setPosts(posts.filter(post => post.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setConfirmError(error.message || 'Error deleting post');
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
            Posts Management
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Posts', value: summary.total, color: 'bg-gray-100 dark:bg-gray-800', icon: DocumentTextIcon },
          { label: 'Published', value: summary.published, color: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircleIcon },
          { label: 'Drafts', value: summary.draft, color: 'bg-yellow-100 dark:bg-yellow-900/20', icon: ClockIcon },
          { label: 'Featured', value: summary.featured, color: 'bg-purple-100 dark:bg-purple-900/20', icon: StarIcon },
          { label: 'Scheduled', value: summary.scheduled, color: 'bg-blue-100 dark:bg-blue-900/20', icon: ClockIcon },
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-lg border ${card.color} border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Posts
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
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
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
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
              <DocumentTextIcon className="h-12 w-12" />
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
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {post.status}
                        </span>
                        {post.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <StarIcon className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {post.excerpt || 'No excerpt available'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        By {post.author?.fullName || post.author?.username || 'Anonymous'}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span>{post.category.name}</span>
                        </>
                      )}
                      {post.viewCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{post.viewCount} views</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" title="View Post">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Edit Post">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Post"
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

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            {confirmError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{confirmError}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="secondary"
                onClick={doDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}