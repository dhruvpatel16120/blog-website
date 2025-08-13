"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Button, Input } from '@/components/ui';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const USER_STATUS = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircleIcon },
  INACTIVE: { label: 'Inactive', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircleIcon },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: ClockIcon },
  SUSPENDED: { label: 'Suspended', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: ArchiveBoxIcon }
};

const USER_ROLES = {
  USER: { label: 'User', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: UserIcon },
  ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: ShieldCheckIcon }
};

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const adminSession = session?.user;
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, pending: 0, admins: 0, users: 0 });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    hasPosts: '',
    hasComments: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Start with 5 users per page
    total: 0
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [session?.user?.role, status, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.limit.toString(),
        sortBy,
        order,
        ...filters
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setPagination(prev => ({ ...prev, total: data.total }));
        
        // Calculate summary
        const summaryData = {
          total: data.total,
          active: data.data?.filter(u => u.isActive).length || 0,
          inactive: data.data?.filter(u => !u.isActive).length || 0,
          pending: data.data?.filter(u => !u.emailVerified).length || 0,
          admins: data.data?.filter(u => u.role === 'ADMIN').length || 0,
          users: data.data?.filter(u => u.role === 'USER').length || 0,
          withAvatars: data.data?.filter(u => u.avatar).length || 0,
          withoutAvatars: data.data?.filter(u => !u.avatar).length || 0
        };
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [filters, pagination.limit, pagination.page, sortBy, order]);

  useEffect(() => {
    if (adminSession) {
      fetchUsers();
    }
  }, [adminSession, fetchUsers]);

  // Check for success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('deleted');
    if (success === 'true') {
      setSuccessMessage('User deleted successfully');
      // Remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      role: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      hasPosts: '',
      hasComments: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        // Refresh summary
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getStatusConfig = (status) => {
    if (status === 'active' || status === true) return USER_STATUS.ACTIVE;
    if (status === 'inactive' || status === false) return USER_STATUS.INACTIVE;
    if (status === 'pending') return USER_STATUS.PENDING;
    return USER_STATUS.INACTIVE;
  };

  const getRoleConfig = (role) => {
    return USER_ROLES[role] || USER_ROLES.USER;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffTime = Math.abs(now - loginDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
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
    <AdminLayout title="User Management" adminSession={adminSession}>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage user accounts, permissions, and monitor user activity
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button
              onClick={() => router.push('/admin/users/new')}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create User
            </Button>
            <Button
              onClick={() => router.push('/admin/users/invite')}
              variant="outline"
              className="flex items-center"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Invite User
            </Button>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/users/generate-avatars', {
                    method: 'POST'
                  });
                  const result = await response.json();
                  if (response.ok) {
                    setSuccessMessage(result.message);
                    fetchUsers(); // Refresh the user list
                  } else {
                    setSuccessMessage('Error: ' + result.error);
                  }
                } catch (error) {
                  setSuccessMessage('Error generating avatars');
                }
              }}
              variant="outline"
              className="flex items-center"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Generate Avatars
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Administrators</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.admins}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.inactive}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {summary.inactive > 0 ? `${summary.inactive} inactive users` : 'All users are active'}
                </p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity
                </label>
                <select
                  value={filters.hasPosts}
                  onChange={(e) => handleFilterChange('hasPosts', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Users</option>
                  <option value="true">With Posts</option>
                  <option value="false">No Posts</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort & Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="createdAt">Created</option>
                    <option value="lastLogin">Last Login</option>
                    <option value="fullName">Name</option>
                    <option value="role">Role</option>
                    <option value="username">Username</option>
                  </select>
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Users ({pagination.total} total)
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
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                </div>
                <Button
                  onClick={fetchUsers}
                  variant="outline"
                  disabled={loadingUsers}
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-4">
                {users.map((user) => {
                  const statusConfig = getStatusConfig(user.isActive);
                  const roleConfig = getRoleConfig(user.role);
                  const StatusIcon = statusConfig.icon;
                  const RoleIcon = roleConfig.icon;

                  return (
                    <div
                      key={user.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusConfig.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusConfig.label}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${roleConfig.color}`}>
                              <RoleIcon className="h-4 w-4" />
                              {roleConfig.label}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Profile</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.fullName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                @{user.username}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                                                             {user.avatar && (
                                 <img 
                                   src={user.avatar} 
                                   alt={user.fullName}
                                   className="w-12 h-12 rounded-full mt-2"
                                   onError={(e) => {
                                     // Fallback to a default avatar if the generated one fails to load
                                     e.target.src = `https://ui-avatars.com/api?name=${user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}&size=48&background=6366f1&color=ffffff&bold=true`;
                                   }}
                                 />
                               )}
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Activity</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Posts: <span className="font-medium">{user.postCount || 0}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Comments: <span className="font-medium">{user.commentCount || 0}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Last Login: <span className="font-medium">{formatLastLogin(user.lastLogin)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Details</p>
                              <div className="space-y-2">
                                {user.bio && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {user.bio}
                                  </p>
                                )}
                                {user.location && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    📍 {user.location}
                                  </p>
                                )}
                                {user.website && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    🌐 {user.website}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Account</p>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Created: {formatDate(user.createdAt)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Updated: {formatDate(user.updatedAt)}
                                </p>
                                {user.emailVerified && (
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    ✓ Email Verified
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            variant="outline"
                            size="sm"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View/Edit
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/users/${user.id}/delete`)}
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
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          variant="outline"
                          size="sm"
                          className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.isActive ? (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        
                        <select
                          value={user.role}
                          onChange={async (e) => {
                            try {
                              const response = await fetch(`/api/admin/users/${user.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ role: e.target.value }),
                              });
                              if (response.ok) {
                                setUsers(users.map(u => 
                                  u.id === user.id ? { ...u, role: e.target.value } : u
                                ));
                                fetchUsers();
                              }
                            } catch (error) {
                              console.error('Error updating user role:', error);
                            }
                          }}
                          className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No users found matching your criteria
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
    </AdminLayout>
  );
}

