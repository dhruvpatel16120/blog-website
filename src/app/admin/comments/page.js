"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { 
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const COMMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: ClockIcon },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircleIcon },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: ExclamationTriangleIcon },
  SPAM: { label: 'Spam', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: ExclamationTriangleIcon }
};

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, spam: 0, today: 0 });
  const [loadingComments, setLoadingComments] = useState(true);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmError, setConfirmError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    postId: '',
    userId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [selectedComments, setSelectedComments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

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
        setComments(data.comments);
        setPagination(prev => ({ ...prev, total: data.total }));
        if (data.summary) setSummary(data.summary);
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
      search: '',
      dateFrom: '',
      dateTo: '',
      postId: '',
      userId: ''
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
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setConfirmDeleteId(commentId);
    setConfirmError('');
  };

  const doDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmError('');
    try {
      const res = await fetch(`/api/admin/comments/${confirmDeleteId}`, { method: 'DELETE' });
      const payload = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to delete');
      setComments(prev => prev.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (e) {
      setConfirmError(e.message);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedComments.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        // For delete, show confirmation modal
        if (!confirm(`Are you sure you want to delete ${selectedComments.length} comment(s)? This action cannot be undone and will also delete all replies to these comments.`)) {
          return;
        }
      }

      const promises = selectedComments.map(async (commentId) => {
        try {
          if (bulkAction === 'approve') {
            const response = await fetch(`/api/admin/comments/${commentId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: true }),
            });
            return { id: commentId, success: response.ok, action: 'approve' };
          } else if (bulkAction === 'reject') {
            const response = await fetch(`/api/admin/comments/${commentId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: false }),
            });
            return { id: commentId, success: response.ok, action: 'reject' };
          } else if (bulkAction === 'delete') {
            const response = await fetch(`/api/admin/comments/${commentId}`, {
              method: 'DELETE',
            });
            return { id: commentId, success: response.ok, action: 'delete' };
          }
        } catch (error) {
          return { id: commentId, success: false, action: bulkAction, error: error.message };
        }
      });

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error('Some bulk actions failed:', failed);
        alert(`${failed.length} out of ${selectedComments.length} actions failed. Check console for details.`);
      }

      setSelectedComments([]);
      setBulkAction('');
      fetchComments();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action. Please try again.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(comment => comment.id));
    }
  };

  const toggleSelectComment = (commentId) => {
    setSelectedComments(prev => 
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusConfig = (approved) => {
    return approved ? COMMENT_STATUS.APPROVED : COMMENT_STATUS.PENDING;
  };

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
    <AdminLayout title="Comment Management" adminSession={adminSession}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: summary.total, color: 'bg-gray-100 dark:bg-gray-800', icon: ChatBubbleLeftIcon },
          { label: 'Pending', value: summary.pending, color: 'bg-yellow-100 dark:bg-yellow-900/20', icon: ClockIcon },
          { label: 'Approved', value: summary.approved, color: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircleIcon },
          { label: 'Rejected', value: summary.rejected, color: 'bg-red-100 dark:bg-red-900/20', icon: ExclamationTriangleIcon },
          { label: 'Spam', value: summary.spam, color: 'bg-orange-100 dark:bg-orange-900/20', icon: ExclamationTriangleIcon },
          { label: 'Today', value: summary.today, color: 'bg-blue-100 dark:bg-blue-900/20', icon: DocumentTextIcon },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 rounded-lg border ${card.color} border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between">
        <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
        </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="spam">Spam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
                <input
                  type="text"
                placeholder="Search by content, author, or post..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedComments.length} comment(s) selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="delete">Delete</option>
              </select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
              <Button variant="outline" onClick={() => setSelectedComments([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comments List */}
        <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comments ({pagination.total} total)
            </h3>
            <Button
              onClick={fetchComments}
              variant="outline"
              disabled={loadingComments}
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                <div className="flex items-start justify-between">
                      <div className="flex-1">
                                                 <div className="flex items-center gap-3 mb-3">
                           <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                             <StatusIcon className="h-3 w-3" />
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
                           <input
                             type="checkbox"
                             checked={selectedComments.includes(comment.id)}
                             onChange={() => toggleSelectComment(comment.id)}
                             className="rounded border-gray-300"
                           />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Post
                            </p>
                            <Link
                              href={`/blog/${comment.post.slug}`}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              {comment.post.title}
                            </Link>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Comment
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {comment.content}
                        </p>
                          </div>
                        </div>

                        {comment.parent && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Reply to:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {comment.parent.author.fullName || comment.parent.author.username}: {comment.parent.content}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
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
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <select
                        value={comment.approved ? 'approved' : 'pending'}
                        onChange={(e) => updateCommentStatus(comment.id, e.target.value === 'approved')}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Mark as Pending</option>
                        <option value="approved">Mark as Approved</option>
                      </select>
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
             {confirmError && <p className="text-sm text-red-600 mt-2">{confirmError}</p>}
             <div className="mt-6 flex justify-end gap-2">
               <Button variant="outline" onClick={()=>{ setConfirmDeleteId(null); setConfirmError(''); }}>Cancel</Button>
               <Button onClick={doDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
             </div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}
