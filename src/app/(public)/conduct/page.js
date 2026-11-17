"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  HeartIcon, 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { REPO_URL } from '@/lib/github';

const standards = [
  {
    title: 'Demonstrate Empathy & Kindness',
    desc: 'Treat other community members with patience, regardless of their background, seniority, or native language.',
    icon: HeartIcon,
    color: 'text-rose-500 bg-rose-500/10'
  },
  {
    title: 'Respect Divergent Viewpoints',
    desc: 'Technical choices involve trade-offs. Discuss architectures with curiosity, data, and mutual respect.',
    icon: ChatBubbleLeftRightIcon,
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    title: 'Accept Feedback Gracefully',
    desc: 'Code review comments and editorial corrections are opportunities for mutual growth, not personal critiques.',
    icon: ShieldCheckIcon,
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    title: 'Focus on Community Good',
    desc: 'Prioritize solutions that benefit the broader open-source ecosystem rather than self-promotion.',
    icon: ExclamationTriangleIcon,
    color: 'text-amber-500 bg-amber-500/10'
  }
];

const enforcementLevels = [
  {
    level: '1. Correction',
    impact: 'Unprofessional language or unwelcome interactions in pull requests, issues, or comments.',
    consequence: 'A private written warning with an explanation of why the conduct fell short of standards.'
  },
  {
    level: '2. Formal Warning',
    impact: 'A pattern of unconstructive behavior or a single moderate violation of community safety.',
    consequence: 'A formal warning with a temporary cool-down period and restriction from community discussions.'
  },
  {
    level: '3. Temporary Suspension',
    impact: 'Harassment, hate speech, targeted attacks, or sustained disruption.',
    consequence: 'A temporary ban from GitHub repositories, discussions, and commenting privileges for a specified duration.'
  },
  {
    level: '4. Permanent Ban',
    impact: 'Demonstrated pattern of abuse, threats, doxxing, or malicious harassment.',
    consequence: 'Permanent exclusion from all project spaces, GitHub repositories, and associated platforms.'
  }
];

export default function ConductPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Community Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Code of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Conduct
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Our pledge to maintain an inclusive, welcoming, and harassment-free environment for all developers, contributors, and readers.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Based on Contributor Covenant v2.1 &bull; Active across all spaces</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Pledge Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              Our Community Pledge
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              We as contributors, maintainers, and readers pledge to make participation in TechBlog a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual orientation.
            </p>
          </div>

          {/* Standards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {standards.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-2.5"
              >
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {s.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Enforcement Guidelines */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              Enforcement &amp; Community Impact Levels
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Project maintainers are responsible for clarifying and enforcing standards. Consequences are calibrated proportionately:
            </p>

            <div className="space-y-3 pt-1">
              {enforcementLevels.map((lvl, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                    {lvl.level}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <strong className="text-[var(--foreground)]">Trigger:</strong> {lvl.impact}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <strong className="text-[var(--foreground)]">Action:</strong> {lvl.consequence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting Inquiries */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Reporting an Incident</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                All reports are reviewed privately by core project maintainers with complete confidentiality.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Contact Maintainers
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)] pt-4">
            <Link href="/contribute" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Contributor Guide &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/team" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Contributors &amp; Team &rarr;
            </Link>
            <span>&bull;</span>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
              <span>GitHub Repo</span>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
