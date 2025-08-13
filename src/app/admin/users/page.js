"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input, Dropdown, Modal } from '@/components/ui';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.type !== 'admin')) {
      router.push('/admin/login');
    }
  }, [session?.user?.type, status, router]);

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterRole, sortBy, order, page, pageSize]);

  // Check for success message from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('deleted') === 'true') {
      setSuccess('User deleted successfully');
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams({
        q: searchTerm,
        status: filterStatus,
        role: filterRole,
        sortBy,
        order,
        page: String(page),
        pageSize: String(pageSize),
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const { data, total: t } = await response.json();
        setUsers(data);
        setTotal(t);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };



  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users; // server-side filtering/sorting

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
    <AdminLayout title="Users Management" adminSession={adminSession}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex gap-2">
          <Button className="flex items-center" onClick={() => { window.location.href = '/admin/users/new'; }} disabled={adminSession?.role === 'MODERATOR'}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create User
          </Button>
          <Button className="flex items-center" variant="outline" onClick={() => { window.location.href = '/admin/users/invite'; }} disabled={adminSession?.role === 'MODERATOR'}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess('')}
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="Search users..."
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
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Role Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={`${sortBy}:${order}`}
                  onChange={(e) => {
                    const [sb, ord] = e.target.value.split(':');
                    setSortBy(sb); setOrder(ord);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white appearance-none"
                >
                  <option value="createdAt:desc">Newest</option>
                  <option value="createdAt:asc">Oldest</option>
                  <option value="lastLogin:desc">Last login (newest)</option>
                  <option value="lastLogin:asc">Last login (oldest)</option>
                  <option value="fullName:asc">Name A-Z</option>
                  <option value="fullName:desc">Name Z-A</option>
                  <option value="role:asc">Role A-Z</option>
                  <option value="role:desc">Role Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {loadingUsers ? (
        <Card>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No users have registered yet'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
        <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {user.fullName || user.username}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.role}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          @{user.username}
                        </p>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          {user.lastLogin && (
                            <>
                              <span>•</span>
                              <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                            </>
                          )}
                          <>
                            <span>•</span>
                            <span>Posts: {user.postCount ?? 0}</span>
                            <span>•</span>
                            <span>Comments: {user.commentCount ?? 0}</span>
                          </>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      disabled={adminSession?.role === 'MODERATOR'}
                    >
                      {user.isActive ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { window.location.href = `/admin/users/${user.id}/edit`; }} disabled={adminSession?.role === 'MODERATOR'}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { window.location.href = `/admin/users/${user.id}/delete`; }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={adminSession?.role === 'MODERATOR'}
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

      {/* Create / Edit Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={editingUser ? 'Edit User' : 'Create User'} size="lg">
        <UserForm
          user={editingUser}
          canAssignAdmin={adminSession?.role === 'SUPER_ADMIN'}
          onCancel={() => setCreateOpen(false)}
          onSaved={() => { setCreateOpen(false); fetchUsers(); }}
        />
      </Modal>

      {/* Invite moved to full page */}

      {/* Pagination */}
      {!loadingUsers && filteredUsers.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • {total} total
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="px-2 py-1 border rounded-md dark:bg-gray-800"
              value={pageSize}
              onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10)); }}
            >
              {[10,20,50,100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</Button>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / pageSize)}>Next</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}


function UserForm({ user, onCancel, onSaved, canAssignAdmin }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    role: user?.role || 'USER',
    isActive: user?.isActive ?? true,
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            fullName: form.fullName,
            role: form.role,
            isActive: form.isActive,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to update user');
        }
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            fullName: form.fullName,
            role: canAssignAdmin ? form.role : (form.role === 'ADMIN' ? 'USER' : form.role),
            password: form.password,
            isActive: form.isActive,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to create user');
        }
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input name="username" value={form.username} onChange={handleChange} required minLength={3} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800">
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            {canAssignAdmin && <option value="ADMIN">Admin</option>}
          </select>
        </div>
        {!isEdit && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="inline-flex items-center space-x-2 text-sm">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            <span>Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}</Button>
      </div>
    </form>
  );
}

function InviteUserForm({ onCancel, onInvited, canAssignAdmin }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'USER',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          role: canAssignAdmin ? form.role : (form.role === 'ADMIN' ? 'USER' : form.role),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      setSuccess('Invitation sent successfully');
      onInvited?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Full name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded-md border dark:bg-gray-800" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 rounded-md border dark:bg-gray-800">
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          {canAssignAdmin && <option value="ADMIN">Admin</option>}
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Sending…' : 'Send Invite'}</Button>
      </div>
    </form>
  );
}

