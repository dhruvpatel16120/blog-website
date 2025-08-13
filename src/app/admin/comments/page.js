"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button } from '@/components/ui';
import { 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const COMMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: ClockIcon },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircleIcon },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: ExclamationTriangleIcon }
};

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loadingComments, setLoadingComments] = useState(true);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Set to 5 comments per page
    total: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [session?.user?.role, status, router]);

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/comments?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setPagination(prev => ({ ...prev, total: data.total }));
        
        // Calculate summary
        const summaryData = {
          total: data.total,
          pending: data.comments?.filter(c => !c.approved).length || 0,
          approved: data.comments?.filter(c => c.approved).length || 0,
          rejected: data.comments?.filter(c => !c.approved).length || 0
        };
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  useEffect(() => {
    if (adminSession) {
      fetchComments();
    }
  }, [adminSession, fetchComments]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const updateCommentStatus = async (commentId, approved) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId ? { ...comment, approved } : comment
          )
        );
        // Refresh summary
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setConfirmDeleteId(commentId);
  };

  const doDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      const res = await fetch(`/api/admin/comments/${confirmDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== confirmDeleteId));
        setConfirmDeleteId(null);
        fetchComments(); // Refresh to update summary
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getStatusConfig = (approved) => {
    return approved ? COMMENT_STATUS.APPROVED : COMMENT_STATUS.PENDING;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout title="Comments Management" adminSession={adminSession}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Comments Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Moderate and manage user comments across all posts
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.rejected}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters & Search</h3>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search comments, authors, or posts..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments List */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments ({pagination.total} total)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }));
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                </div>
                <Button
                  onClick={fetchComments}
                  variant="outline"
                  disabled={loadingComments}
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const statusConfig = getStatusConfig(comment.approved);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={comment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusConfig.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusConfig.label}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                            {comment._count?.replies > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                                {comment._count.replies} reply{comment._count.replies !== 1 ? 'ies' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Author</p>
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {comment.author.avatar ? (
                                    <Image
                                      src={comment.author.avatar}
                                      alt={comment.author.fullName}
                                      width={40}
                                      height={40}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                      <span className="text-gray-600 font-semibold">
                                        {comment.author.fullName?.charAt(0) || comment.author.username?.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {comment.author.fullName || comment.author.username}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {comment.author.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Post</p>
                              <Link
                                href={`/blog/${comment.post.slug}`}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                              >
                                {comment.post.title}
                              </Link>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Comment</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                {comment.content}
                              </p>
                            </div>
                          </div>

                          {comment.parent && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Reply to:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong>{comment.parent.author.fullName || comment.parent.author.username}:</strong> {comment.parent.content}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            onClick={() => {
                              setSelectedComment(comment);
                              setShowDetailModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => updateCommentStatus(comment.id, true)}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          disabled={comment.approved}
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateCommentStatus(comment.id, false)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={!comment.approved}
                        >
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No comments found matching your criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <Button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Comment Detail Modal */}
      {showDetailModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comment Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Author
                </p>
                <div className="flex items-center gap-3">
                  {selectedComment.author.avatar ? (
                    <Image
                      src={selectedComment.author.avatar}
                      alt={selectedComment.author.fullName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {selectedComment.author.fullName?.charAt(0) || selectedComment.author.username?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedComment.author.fullName || selectedComment.author.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedComment.author.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Post
                </p>
                <Link
                  href={`/blog/${selectedComment.post.slug}`}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {selectedComment.post.title}
                </Link>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Comment
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedComment.content}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(selectedComment.createdAt)}
                </p>
              </div>

              {selectedComment.parent && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Reply to
                  </p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>{selectedComment.parent.author.fullName || selectedComment.parent.author.username}:</strong> {selectedComment.parent.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedComment(null);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Comment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Are you sure you want to delete this comment? This action cannot be undone and will also delete all replies to this comment.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button onClick={doDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
