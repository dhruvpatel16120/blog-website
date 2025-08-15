"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { 
  PlusIcon,
  DocumentTextIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  TagIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.type !== 'admin') {
      router.push('/admin/login?error=unauthorized');
      return;
    }

    if (!session.user?.isActive) {
      router.push('/admin/login?error=account_deactivated');
      return;
    }

    fetchStats();
    setIsLoading(false);
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.type !== 'admin') {
    return null; // Will redirect
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        
        {/* Summary Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[ 
            { label: 'Total Posts', value: stats?.totalPosts || 0, icon: DocumentTextIcon, color: 'bg-gray-900 dark:bg-black', textColor: 'text-white' },
            { label: 'Published', value: stats?.publishedPosts || 0, icon: CheckCircleIcon, color: 'bg-green-900 dark:bg-green-800', textColor: 'text-white' },
            { label: 'Drafts', value: stats?.draftPosts || 0, icon: ClockIcon, color: 'bg-yellow-900 dark:bg-yellow-800', textColor: 'text-white' },
            { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderIcon, color: 'bg-purple-900 dark:bg-purple-800', textColor: 'text-white' },
            { label: 'Tags', value: stats?.totalTags || 0, icon: TagIcon, color: 'bg-blue-900 dark:bg-blue-800', textColor: 'text-white' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${item.color} border-gray-700 dark:border-gray-600 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${item.textColor} opacity-80`}>{item.label}</p>
                  <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                </div>
                <item.icon className={`h-8 w-8 ${item.textColor} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        {/* Comments + Contacts Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
                <Link href="/admin/comments" className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalComments || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">Pending</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats?.pendingComments || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-green-700 dark:text-green-300">Approved</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats?.approvedComments || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h3>
                <Link href="/admin/contacts" className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.totalContacts || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">Pending</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats?.pendingContacts || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-green-700 dark:text-green-300">Responded</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats?.respondedContacts || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs text-red-700 dark:text-red-300">Spam</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">{stats?.spamContacts || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tags and Comments Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags Management</h3>
                <Link href="/admin/tags" className="text-sm text-blue-600 hover:underline">Manage</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Tags</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats?.totalTags || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-sm text-blue-600 dark:text-blue-300">Used Tags</span>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                    {stats?.totalTags || 0}
                  </span>
                </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click &quot;Manage&quot; to add, edit, or organize tags
                  </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments Overview</h3>
                <Link href="/admin/comments" className="text-sm text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Comments</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats?.totalComments || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">Pending Approval</span>
                  <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">{stats?.pendingComments || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm text-green-700 dark:text-green-300">Approved</span>
                  <span className="text-lg font-semibold text-green-700 dark:text-green-300">{stats?.approvedComments || 0}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {stats?.pendingComments > 0 ? `${stats.pendingComments} comments need approval` : 'All comments are approved'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Posts Tab */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h3>
              <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats?.recentPosts?.map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <a 
                    href={`/blog/${post.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {post.title}
                    </h4>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span>{post._count.comments} comments</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Categories Tab */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
              <Link href="/admin/categories" className="text-sm text-blue-600 hover:underline">Manage</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {stats?.categories?.map((category) => (
                <a 
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {category._count.posts} posts
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Card>

        {/* CTAs */}
        <Card>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/posts/new">
                <Button className="w-full flex items-center justify-center">
                  <PlusIcon className="h-4 w-4 mr-2" /> New Post
                </Button>
              </Link>
              <Link href="/admin/users/invite">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <UserPlusIcon className="h-4 w-4 mr-2" /> Invite User
                </Button>
              </Link>
              <Link href="/admin/contacts">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" /> Review Contacts
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
