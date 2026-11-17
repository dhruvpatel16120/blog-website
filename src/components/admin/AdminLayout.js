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
  PhotoIcon,
  GlobeAltIcon
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
    return `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      active
        ? 'bg-[var(--primary)] text-white shadow-xs font-semibold'
        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
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
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[var(--card)] border-r border-[var(--border)] shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                TB
              </div>
              <span className="font-bold text-base text-[var(--foreground)]">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
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
                <item.icon className="mr-3 h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-[var(--border)]">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-[var(--card)] border-r border-[var(--border)]">
          <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                TB
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-[var(--foreground)] block">
                  TechBlog Admin
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] block">
                  v2.0 Production
                </span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClasses(item.href)}
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-[var(--border)]">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4 text-[var(--primary)]" />
              <span>View Public Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xs px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="-m-2 p-2 text-[var(--foreground)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">
                {navigation.find(item => isActive(item.href))?.name || title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />

            {/* Admin identity */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                {(adminSession.fullName || adminSession.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">
                  {adminSession.fullName || adminSession.username}
                </p>
                <p className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">
                  {adminSession.role}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="ml-2 gap-1.5 cursor-pointer text-xs"
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
