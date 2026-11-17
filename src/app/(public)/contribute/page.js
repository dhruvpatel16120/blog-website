"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CodeBracketIcon, 
  ArrowTopRightOnSquareIcon, 
  StarIcon, 
  SparklesIcon,
  CheckCircleIcon,
  CommandLineIcon,
  DocumentTextIcon,
  HeartIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { REPO_URL, FALLBACK_REPO_DATA } from '@/lib/github';

const steps = [
  {
    step: '01',
    title: 'Fork & Clone the Repo',
    desc: 'Create your own fork of dhruvpatel16120/blog-website and clone it to your development machine.',
    cmd: `git clone https://github.com/<your-username>/blog-website.git\ncd blog-website`,
  },
  {
    step: '02',
    title: 'Install & Configure',
    desc: 'Install dependencies, create your local .env configuration, and run Prisma migrations.',
    cmd: `npm install\ncp .env.example .env\nnpx prisma db push`,
  },
  {
    step: '03',
    title: 'Develop on a Branch',
    desc: 'Create a focused feature branch. Follow conventional commit messages (e.g., feat: ..., fix: ...).',
    cmd: `git checkout -b feature/your-feature-name\nnpm run dev`,
  },
  {
    step: '04',
    title: 'Lint & Submit PR',
    desc: 'Verify zero lint warnings before pushing. Then open a pull request against the main branch.',
    cmd: `npm run lint\ngit push origin feature/your-feature-name`,
  },
];

const contributionAreas = [
  {
    title: 'Core Features & APIs',
    desc: 'Enhance authentication, optimize Prisma queries, or implement new content management capabilities.',
    tag: 'Engineering',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    title: 'Frontend UI & Accessibility',
    desc: 'Refine Tailwind styles, dark mode contrast, micro-interactions, and mobile responsiveness.',
    tag: 'UI / UX',
    color: 'text-indigo-500 bg-indigo-500/10'
  },
  {
    title: 'Technical Documentation',
    desc: 'Improve setup instructions, API documentation, or author in-depth blog tutorials.',
    tag: 'Docs & Guides',
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    title: 'Bug Hunting & Security',
    desc: 'Identify edge cases, report security vulnerabilities, or resolve issues labeled "good first issue".',
    tag: 'Quality',
    color: 'text-purple-500 bg-purple-500/10'
  }
];

export default function ContributePage() {
  const [repo, setRepo] = useState(FALLBACK_REPO_DATA);

  useEffect(() => {
    let isMounted = true;
    async function loadRepo() {
      try {
        const res = await fetch('/api/github');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.repo) {
          setRepo(data.repo);
        }
      } catch {
        // Fallback initialized
      }
    }
    loadRepo();
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
            <CodeBracketIcon className="w-4 h-4" />
            <span>Open Source Community</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Contributor{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Guide
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Everything you need to set up your local development environment, pick up open issues, and submit high-quality pull requests to TechBlog.
          </p>

          {/* GitHub Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <StarIcon className="w-6 h-6 text-amber-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.stargazers_count ?? 2}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Stars on GitHub</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <CodeBracketIcon className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.open_issues_count ?? 0}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Open Issues</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.license?.spdx_id || 'MIT'}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">License</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <SparklesIcon className="w-6 h-6 text-purple-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">Next.js 15</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Framework</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer"
            >
              <span>Explore Good First Issues</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-[var(--foreground)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
            >
              <span>Fork on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4-Step Contribution Flow */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Step-by-Step Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2">
              Follow these simple steps from local setup to landing your pull request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pl-11">
                    {s.desc}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] font-mono text-[11px] text-[var(--foreground)] overflow-x-auto whitespace-pre">
                  {s.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contribution Areas Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)] bg-[var(--muted)]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Where You Can Make an Impact
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2">
              Pick the domain that aligns best with your technical background and interests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contributionAreas.map((area, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      {area.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {area.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Commitments & Next Steps */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-12 border border-[var(--border)] bg-[var(--card)] shadow-xs text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Ready to Contribute?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
              Every contributor is celebrated on our team page and credited in release notes. Read the Code of Conduct before opening your first PR.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/conduct"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer"
              >
                <span>Read Code of Conduct</span>
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-[var(--foreground)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
              >
                View Contributors List
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
