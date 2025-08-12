"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  BellIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-700'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-700'
  },
  info: {
    icon: InformationCircleIcon,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-700'
  },
  error: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-700'
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  useEffect(() => {
    let intervalId;
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
        intervalId = undefined;
      } else {
        // Fetch immediately when tab becomes active
        fetchNotifications();
        // Poll every 60s while active
        if (!intervalId) intervalId = setInterval(fetchNotifications, 60000);
      }
    };

    // Start when mounted and visible
    if (!document.hidden) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 60000);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

    const fetchNotifications = useCallback(async () => {
    const controller = new AbortController();
    try {
      const res = await fetch('/api/admin/notifications', { signal: controller.signal });
      if (!res.ok) {
        if (res.status === 401) {
          // pause fetching until session restored
          return;
        }
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to fetch notifications');
      }
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => !n.read).length);
      setLastFetchedAt(Date.now());
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching notifications:', error);
        // simple backoff retry once after 2s when transient network
        setTimeout(() => {
          fetchNotifications();
        }, 2000);
        }
      }
    return () => controller.abort();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const openPanel = () => {
    setIsOpen((prev) => !prev);
    // Lazy fetch when opening if older than 30s
    if (!lastFetchedAt || Date.now() - lastFetchedAt > 30000) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={openPanel}
        className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
                  const IconComponent = typeConfig.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
