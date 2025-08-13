'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui';

export default function DeleteUserPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id, fetchUser]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete user');
      }
      
      // Redirect to users list with success message
      router.push('/admin/users?deleted=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') return null;
  if (!user) {
    return (
      <AdminLayout title="User Not Found" adminSession={adminSession}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
        </div>
      </AdminLayout>
    );
  }

  const canDelete = adminSession?.role === 'ADMIN' && 
                   adminSession?.id !== user.id && 
                   user.role !== 'ADMIN';

  const hasPosts = user.posts?.length > 0;
  const hasComments = user.comments?.length > 0;

  return (
    <AdminLayout title="Delete User" adminSession={adminSession}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Delete User</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to permanently delete this user account. This action cannot be undone.
          </p>
        </div>

        {/* User Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{user.fullName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {user.role}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</label>
              <p className="text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* User Activity Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user.posts?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Blog Posts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user.comments?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.likes?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Likes Given</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Warnings */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Warnings</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>This action cannot be undone.</strong> All user data will be permanently deleted.</li>
                  {hasPosts && <li><strong>User has {user.posts.length} blog posts</strong> that will also be deleted.</li>}
                  {hasComments && <li><strong>User has {user.comments.length} comments</strong> that will also be deleted.</li>}
                  <li>All user activity, likes, and interactions will be removed.</li>
                  <li>If this user has any pending tasks or responsibilities, please reassign them first.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Deletion Confirmation */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confirm Deletion</h2>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                I understand that this action is irreversible and I want to delete this user
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/users')}
              disabled={deleting}
            >
              Cancel
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!confirmDelete || deleting || !canDelete}
              className="min-w-[120px]"
            >
              {deleting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Delete User'
              )}
            </Button>
          </div>

          {/* Permission Notice */}
          {!canDelete && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {adminSession?.id === user.id ? 'You cannot delete your own account.' :
                 adminSession?.role === 'ADMIN' && user.role === 'ADMIN' ? 'You cannot delete users with ADMIN roles.' :
                 'You do not have permission to delete this user.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
