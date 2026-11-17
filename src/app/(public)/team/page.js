"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  SparklesIcon, 
  StarIcon, 
  CodeBracketIcon, 
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  HeartIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { REPO_URL, FALLBACK_REPO_DATA, FALLBACK_CONTRIBUTORS } from '@/lib/github';

export default function TeamPage() {
  const [repo, setRepo] = useState(FALLBACK_REPO_DATA);
  const [contributors, setContributors] = useState(FALLBACK_CONTRIBUTORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadGitHubData() {
      try {
        const res = await fetch('/api/github');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (isMounted && data.success) {
          if (data.repo) setRepo(data.repo);
          if (data.contributors && data.contributors.length > 0) {
            setContributors(data.contributors);
          }
        }
      } catch (err) {
        console.warn('Using fallback contributors:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGitHubData();
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
            <UserGroupIcon className="w-4 h-4" />
            <span>Open Source Team</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            The Builders &amp;{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Contributors
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            TechBlog is an open-source project created and maintained by passionate software engineers. Meet the developers who write the code, review pull requests, and shape the platform.
          </p>

          {/* GitHub Live Repository Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <UserGroupIcon className="w-6 h-6 text-blue-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{contributors.length}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Contributors</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <StarIcon className="w-6 h-6 text-amber-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.stargazers_count ?? 2}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">GitHub Stars</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <CodeBracketIcon className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.language || 'JavaScript'}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Primary Tech</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center">
              <CheckBadgeIcon className="w-6 h-6 text-emerald-500 mb-1" />
              <span className="text-xl font-black text-[var(--foreground)]">{repo.license?.spdx_id || 'MIT'}</span>
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Open License</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Synced live via GitHub Public API &bull; {REPO_URL.replace('https://github.com/', '')}</span>
          </div>
        </div>
      </section>

      {/* Contributors Grid Section */}
      <section className="py-16 sm:py-20 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Repository Contributors
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2">
              Every commit, bug fix, refactor, and documentation improvement counts. Profiles and contribution metrics are pulled directly from GitHub.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contributors.map((c) => {
              const isMaintainer = c.login.toLowerCase() === 'dhruvpatel16120';
              return (
                <div
                  key={c.login}
                  className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Contributor Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-xs shrink-0">
                        <Image
                          src={c.avatar_url}
                          alt={c.login}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-[var(--foreground)] truncate">
                            {c.name || c.login}
                          </h3>
                          {isMaintainer && (
                            <span title="Creator & Maintainer" className="text-indigo-500 shrink-0">
                              <CheckBadgeIcon className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block truncate mt-0.5"
                        >
                          @{c.login}
                        </a>
                        <span className="inline-block px-2 py-0.5 mt-2 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {c.role || (isMaintainer ? 'Creator & Lead Maintainer' : 'Contributor')}
                        </span>
                      </div>
                    </div>

                    {c.bio && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-4 leading-relaxed">
                        {c.bio}
                      </p>
                    )}
                  </div>

                  {/* Footer with contribution metric and link */}
                  <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span>{c.contributions}</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {c.contributions === 1 ? 'commit' : 'commits'}
                        </span>
                      </span>
                    </div>

                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>Profile</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Join the Project Banner */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-12 border border-[var(--border)] bg-[var(--card)] shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <HeartIcon className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Want to See Your Avatar Here?
            </h2>

            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
              We welcome code submissions, bug fixes, documentation improvements, and architectural suggestions from developers of all skill levels.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <Link
                href="/contribute"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer"
              >
                <span>Read Contributor Guide</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider text-[var(--foreground)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer"
              >
                <span>Browse Open Issues</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
