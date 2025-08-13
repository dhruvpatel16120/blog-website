"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  FolderIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Posts', href: '/admin/posts', icon: DocumentTextIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Tags', href: '/admin/tags', icon: TagIcon },
  { name: 'Comments', href: '/admin/comments', icon: ChatBubbleLeftRightIcon },
  { name: 'Contacts', href: '/admin/contacts', icon: EnvelopeIcon },
  { name: 'Files', href: '/admin/files', icon: PhotoIcon },
  // Removed Analytics and Audit from navigation
  // Settings removed
];

export default function AdminLayout({ children, title = 'Admin Panel', adminSession: adminSessionProp }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Prefer explicitly passed session from server components if present
  const adminSession = adminSessionProp ?? session?.user;

  // Function to check if a navigation item is active
  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  // Function to get navigation item classes
  const getNavItemClasses = (href) => {
    const active = isActive(href);
    return `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
      active
        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-400 shadow-sm transform translate-x-1'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white hover:translate-x-1'
    }`;
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (!adminSession) {
    // While session is loading, show a lightweight loader to avoid blank screen
    if (status === 'loading' && !adminSessionProp) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClasses(item.href)}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClasses(item.href)}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Mobile current page indicator */}
          <div className="lg:hidden flex items-center ml-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </span>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              {/* Current page indicator */}
              <div className="hidden sm:flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Current:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Admin profile dropdown */}
              <div className="relative">
                <div className="flex items-center gap-x-3">
                  <div className="flex items-center gap-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {adminSession.fullName || adminSession.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminSession.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span className="hidden lg:block">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <Link 
                    href="/admin" 
                    className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Admin
                  </Link>
                </li>
                {pathname !== '/admin' && (
                  <>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li className="text-gray-700 dark:text-gray-300 font-medium">
                      {navigation.find(item => isActive(item.href))?.name || title}
                    </li>
                  </>
                )}
              </ol>
            </nav>
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
