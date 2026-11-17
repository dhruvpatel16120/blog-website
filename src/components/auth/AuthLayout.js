"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
  title,
  subtitle,
  badge = null,
  showLogo = true,
  maxWidth = "max-w-md",
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group"
          aria-label="Back to home"
        >
          <div className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] group-hover:border-[var(--primary)] transition-colors">
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span className="hidden sm:inline">Back to Blog</span>
        </Link>

        {showLogo && (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              TB
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--foreground)]">
              TechBlog
            </span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle size="md" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className={`w-full ${maxWidth} mx-auto`}>
          {badge && (
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                {badge}
              </span>
            </div>
          )}

          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-lg p-6 sm:p-8 transition-all">
            {children}
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-[var(--muted-foreground)] border-t border-[var(--border)]">
        <p>&copy; {new Date().getFullYear()} TechBlog. Thoughtfully crafted for engineers & creators.</p>
      </footer>
    </div>
  );
}
