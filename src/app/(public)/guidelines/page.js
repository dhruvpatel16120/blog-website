"use client";

import React from 'react';
import Link from 'next/link';
import { 
  SparklesIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CodeBracketIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const principles = [
  {
    icon: HeartIcon,
    title: 'Be Respectful & Constructive',
    badge: 'Code of Conduct',
    color: 'text-rose-500 bg-rose-500/10',
    description: 'Every developer has different experience levels. Disagreements on technical design or tools are welcome, but personal attacks, snide remarks, and dismissive attitudes are strictly prohibited.'
  },
  {
    icon: CodeBracketIcon,
    title: 'Code Sharing & Attribution',
    badge: 'Engineering Etiquette',
    color: 'text-blue-500 bg-blue-500/10',
    description: 'When sharing code snippets or suggestions in discussion comments, ensure you have the right to post them. Credit original creators, note licenses, and avoid pasting proprietary internal secrets or API keys.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Stay Focused On Topic',
    badge: 'Relevance',
    color: 'text-indigo-500 bg-indigo-500/10',
    description: 'Keep comment threads relevant to the article content, code implementation, or architecture trade-offs. Off-topic discussions distract from the technical value of the guide.'
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Zero Tolerance for Spam',
    badge: 'Integrity',
    color: 'text-amber-500 bg-amber-500/10',
    description: 'Unsolicited advertising, affiliate referral spam, automated bot comments, and self-promotional linking without technical context will result in immediate comment removal and account restrictions.'
  }
];

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>Community Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Community{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Guidelines
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            TechBlog is a collaborative platform for builders, learners, and senior engineers. These ground rules protect an environment where technical ideas flourish.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Last updated: November 2026 &bull; Applied to all discussions</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              Welcome to the Conversation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Whether you are sharing an alternative database query, offering an optimization for React re-renders, or asking for clarification on an architectural pattern, your voice matters. We ask every reader to uphold the values of thoughtful engineering and mutual respect.
            </p>
          </div>

          {/* Principle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center shrink-0`}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reporting & Moderation Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                Moderation &amp; Reporting Violations
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Our editorial and engineering team reviews flagged discussions daily. We believe in proportionate, transparent moderation:
            </p>

            <div className="space-y-2.5 text-xs text-[var(--muted-foreground)]">
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-0.5">1. Friendly Warnings:</strong>
                For minor unintentional off-topic comments or formatting mistakes, our moderators will leave a polite note or edit the formatting for readability.
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-0.5">2. Content Deletion:</strong>
                Blatant harassment, hateful conduct, spam links, or malicious code injection attempts are purged immediately without warning.
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-0.5">3. Account Suspension:</strong>
                Repeated infractions or bad-faith trolling will result in permanent suspension of commenting privileges.
              </div>
            </div>
          </div>

          {/* Help & Contact Banner */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Notice an Issue or Bug?</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Report abusive comments or reach our moderation team directly.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Report to Moderators
            </Link>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)] pt-4">
            <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About TechBlog &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service &rarr;
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
