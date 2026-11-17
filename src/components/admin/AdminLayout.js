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
  PhotoIcon,
  GlobeAltIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button, ThemeToggle } from '@/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Posts', href: '/admin/posts', icon: DocumentTextIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Tags', href: '/admin/tags', icon: TagIcon },
  { name: 'Comments', href: '/admin/comments', icon: ChatBubbleLeftRightIcon },
  { name: 'Contacts', href: '/admin/contacts', icon: EnvelopeIcon },
  { name: 'Files', href: '/admin/files', icon: PhotoIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
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

  // Modern blue-purple themed navigation item classes
  const getNavItemClasses = (href) => {
    const active = isActive(href);
    return `group flex items-center px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/25'
        : 'text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40'
    }`;
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
    router.refresh();
  };

  if (!adminSession) {
    if (status === 'loading' && !adminSessionProp) {
      return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-[#070b14] text-[var(--foreground)] transition-colors duration-200">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-indigo-950/80 shadow-2xl">
          <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-indigo-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">
                TB
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent block">
                  TechBlog Admin
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">
                  Control Panel
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClasses(item.href)}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-200/80 dark:border-indigo-950/70">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/60 dark:border-indigo-900/40 hover:scale-[1.01] transition-all"
            >
              <GlobeAltIcon className="w-4 h-4 text-indigo-500" />
              <span>Back to Public Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-indigo-950/80 shadow-xs">
          {/* Top subtle blue-purple gradient accent */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Logo Brand Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/80 dark:border-indigo-950/70">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                TB
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent block">
                  TechBlog Admin
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wide block">
                    Pro Control Panel
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 px-3.5 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClasses(item.href)}
              >
                <item.icon className="mr-3 h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Link to Public Site */}
          <div className="p-3.5 border-t border-slate-200/80 dark:border-indigo-950/70">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/60 dark:border-indigo-900/40 hover:scale-[1.01] transition-all shadow-xs"
            >
              <GlobeAltIcon className="w-4 h-4 text-indigo-500" />
              <span>View Public Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-indigo-950/80 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="-m-2 p-2 text-gray-700 dark:text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {navigation.find(item => isActive(item.href))?.name || title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />

            {/* Admin identity */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-indigo-950/80">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(adminSession.fullName || adminSession.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                  {adminSession.fullName || adminSession.username}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  {adminSession.role}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="ml-2 gap-1.5 cursor-pointer text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
