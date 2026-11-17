"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  CircleStackIcon, 
  AdjustmentsHorizontalIcon, 
  ClockIcon, 
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Transparency &amp; Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Cookie{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            We believe in honest, minimal data collection. Here is a clear breakdown of the small text files stored in your browser and how you control them.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Last reviewed: November 2026 &bull; Version 2.0</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Card 1: What Are Cookies */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <CircleStackIcon className="w-4 h-4" />
              </div>
              <span>What Are Cookies?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Cookies are small data files saved to your computer or mobile device when you visit a website. They allow the site to remember your authentication session, preserve your visual theme preference (light or dark mode), and help us understand which tutorials readers find most useful.
            </p>
          </div>

          {/* Card 2: How We Use Cookies */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </div>
              <span>How We Use Them on TechBlog</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              We keep our cookie footprint lean. We only set cookies that serve a distinct functional or diagnostic purpose:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                <span className="font-bold text-[var(--foreground)] block mb-1">🔐 Auth &amp; Session</span>
                <span className="text-[var(--muted-foreground)]">Keeps your account authenticated securely without asking for credentials on every page.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                <span className="font-bold text-[var(--foreground)] block mb-1">🌓 Theme Persistence</span>
                <span className="text-[var(--muted-foreground)]">Remembers your preferred color scheme (light, dark, or system default) across visits.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                <span className="font-bold text-[var(--foreground)] block mb-1">🛡️ Anti-Abuse &amp; Security</span>
                <span className="text-[var(--muted-foreground)]">Prevents automated spam submissions and protects contact and comment forms against CSRF.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                <span className="font-bold text-[var(--foreground)] block mb-1">📊 Privacy-Friendly Metrics</span>
                <span className="text-[var(--muted-foreground)]">Aggregates anonymous view counts so we know which engineering tutorials need updates.</span>
              </div>
            </div>
          </div>

          {/* Card 3: Types of Cookies */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              Detailed Cookie Categories
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">1. Essential / Strictly Necessary</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Required</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  These cookies are mandatory for authentication tokens (NextAuth JWT session) and form security. Without them, you cannot log into your dashboard or comment on articles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">2. Functional &amp; Preferences</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Optional</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Stores your visual interface choices such as code snippet copy history and syntax highlighter preferences.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">3. Anonymous Analytics</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Optional</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Tracks aggregate bounce rates and technical article popularity. We do not sell this data, and IP addresses are masked.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Managing Cookies */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              How to Control &amp; Remove Cookies
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              You have full control. You can clear, reject, or block cookies at any time directly through your web browser preferences:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--muted-foreground)]">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-0.5">Google Chrome:</strong>
                Settings &rarr; Privacy &amp; Security &rarr; Third-party cookies
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-0.5">Mozilla Firefox:</strong>
                Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-0.5">Apple Safari:</strong>
                Preferences &rarr; Privacy &rarr; Manage Website Data
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-0.5">Microsoft Edge:</strong>
                Settings &rarr; Cookies and site permissions
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] italic">
              Note: Disabling essential cookies will log you out of your account and require logging back in.
            </p>
          </div>

          {/* Card 5: Contact Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Questions About Our Policies?</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Reach out to our privacy lead with any questions or data requests.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Contact Support
            </Link>
          </div>

          {/* Quick Legal Links Footer */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)] pt-4">
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/guidelines" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Community Guidelines &rarr;
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
