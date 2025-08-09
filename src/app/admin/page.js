"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/lib/admin-session';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { 
  DocumentTextIcon, 
  UsersIcon, 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { adminSession, loading } = useAdminSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!loading && !adminSession) {
      router.push('/admin/login');
    }
  }, [adminSession, loading, router]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminSession) {
    return null;
  }

  const statCards = [
    {
      name: 'Total Posts',
      value: stats.totalPosts,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/admin/posts'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-green-500',
      href: '/admin/users'
    },
    {
      name: 'Total Comments',
      value: stats.totalComments,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-yellow-500',
      href: '/admin/comments'
    },
    {
      name: 'Total Views',
      value: stats.totalViews,
      icon: EyeIcon,
      color: 'bg-purple-500',
      href: '/admin/analytics'
    }
  ];

  const quickActions = [
    {
      name: 'Create New Post',
      href: '/admin/posts/new',
      icon: PlusIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: UsersIcon,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'View Analytics',
      href: '/admin/analytics',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Welcome Section */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome back, {adminSession.fullName || adminSession.username}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You are logged in as an administrator with role: <strong>{adminSession.role}</strong>
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-2" />
            Last login: {adminSession.lastLogin ? new Date(adminSession.lastLogin).toLocaleString() : 'Never'}
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className={`flex items-center justify-center w-full px-4 py-3 text-white font-medium rounded-lg transition-colors ${action.color}`}
                >
                  <action.icon className="h-5 w-5 mr-2" />
                  {action.name}
                </a>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
                             {recentActivity.length > 0 ? (
                 recentActivity.map((activity) => (
                   <div key={activity.id} className="flex items-start space-x-3">
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                         <CheckCircleIcon className="h-4 w-4 text-green-600" />
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-gray-900 dark:text-white">
                         {activity.action}
                       </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {activity.description}
                       </p>
                       {activity.user && (
                         <p className="text-xs text-gray-400 dark:text-gray-500">
                           by {activity.user.fullName || activity.user.username}
                         </p>
                       )}
                       <p className="text-xs text-gray-400 dark:text-gray-500">
                         {new Date(activity.timestamp).toLocaleString()}
                       </p>
                     </div>
                   </div>
                 ))
               ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent activity to display
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mt-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">System Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">Database Connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">Authentication Active</span>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
