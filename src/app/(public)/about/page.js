"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { REPO_URL, FALLBACK_REPO_DATA } from '@/lib/github';

// Core editorial values
const values = [
  {
    icon: LightBulbIcon,
    title: 'Production-Tested Insights',
    description: 'We test architectures and libraries in real applications before writing about them. No hype cycles—only solutions that resolve actual bottlenecks.'
  },
  {
    icon: CodeBracketIcon,
    title: 'Open Source Transparency',
    description: 'The entire TechBlog platform is open source on GitHub. Every architecture decision, schema, and UI component is inspectable and reproducible.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Deep-Dive Clarity',
    description: 'Complex distributed systems and Next.js internals do not need convoluted prose. We unpack concepts with minimal diagrams and clear explanations.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Accessible Knowledge',
    description: 'All tutorials, sample repositories, and architectural breakdowns remain free and open to software engineers across the globe.'
  }
];

export default function AboutPage() {
  const [repo, setRepo] = useState(FALLBACK_REPO_DATA);

  useEffect(() => {
    let isMounted = true;
    async function fetchRepoInfo() {
      try {
        const res = await fetch('/api/github');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.repo) {
          setRepo(data.repo);
        }
      } catch {
        // Fallback already initialized
      }
    }
    fetchRepoInfo();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>Open Source Project</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Practical Engineering for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Modern Developers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            TechBlog is an open-source technical journal and blogging platform designed for engineers, authors, and tech teams. Built with Next.js 15, Prisma, and Tailwind CSS.
          </p>

          {/* Live GitHub Repository Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <StarIcon className="w-6 h-6 text-amber-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.stargazers_count ?? 2}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">GitHub Stars</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <CodeBracketIcon className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.language || 'JavaScript'}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Core Stack</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <CheckBadgeIcon className="w-6 h-6 text-emerald-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.license?.spdx_id || 'MIT'}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Open Source</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <UserGroupIcon className="w-6 h-6 text-blue-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">Community</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Driven Dev</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer"
            >
              <span>GitHub Repository</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
            <Link
              href="/team"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-[var(--foreground)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
            >
              Meet the Contributors
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Our Development Values
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
              We cut through the noise with deep, reproducible technical content and transparent code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs hover:shadow-sm transition-shadow flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Repository & Open Source Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--muted)]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <span>Open Source Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                Built in Public on GitHub
              </h2>
              <div className="space-y-3.5 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                <p>
                  TechBlog is fully open-source. Anyone can inspect our code, review database schemas, suggest architectural improvements, or fork the repository to build their own blog platform.
                </p>
                <p>
                  We welcome contributions from everyone — from fixing broken links in tutorials to adding full-stack features like new authentication providers or caching layers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {(repo.topics || ['nextjs', 'reactjs', 'prisma', 'tailwindcss', 'admin-panel']).map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <CodeBracketIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {repo.license?.spdx_id || 'MIT'} Licensed
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Project Repository
                </h3>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {repo.description}
                </p>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)] font-medium">Branch: <strong className="text-[var(--foreground)]">{repo.default_branch || 'main'}</strong></span>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Repository</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Links & Action */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-12 border border-[var(--border)] bg-[var(--card)] shadow-xs text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Get Involved in TechBlog
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
              Explore our contributor guide, read the community code of conduct, or reach out to collaborate on technical content.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/contribute"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer"
              >
                <span>Contribution Guide</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/conduct"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-[var(--foreground)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
              >
                Code of Conduct
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
