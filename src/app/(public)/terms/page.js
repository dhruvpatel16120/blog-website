"use client";

import React from 'react';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  ScaleIcon, 
  CheckCircleIcon, 
  EnvelopeIcon,
  ClockIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const termsSections = [
  {
    number: '01',
    title: 'Acceptance of Terms',
    content: 'By accessing or reading TechBlog, subscribing to newsletters, or posting comments, you agree to comply with and be bound by these Terms of Service and our associated Privacy Policy. If you do not agree, please discontinue using the platform.'
  },
  {
    number: '02',
    title: 'Code Samples & Educational License',
    content: 'Code snippets, repository templates, and technical architectures published on TechBlog are provided for educational and illustrative purposes. Unless specified otherwise by an accompanying repository license (e.g., MIT or Apache 2.0), snippets may be integrated into your personal or commercial applications at your own discretion.'
  },
  {
    number: '03',
    title: 'User Contributions & Commenting',
    content: 'You retain ownership of any comments, feedback, or guest articles you submit. By posting on TechBlog, you grant us an irrevocable, non-exclusive license to display, index, and moderate your contribution in connection with the blog service.'
  },
  {
    number: '04',
    title: 'Prohibited Conduct',
    content: 'You agree not to use the platform to distribute malware, execute automated web-scraping beyond reasonable search engine indexing, inject cross-site scripting (XSS) payloads in comments, or engage in denial-of-service attempts against our infrastructure.'
  },
  {
    number: '05',
    title: 'Intellectual Property',
    content: 'The TechBlog logo, written editorial narratives, branding, and customized layout designs are proprietary assets protected by applicable copyright and trademark laws. Unauthorized reproduction of entire articles without attribution and backlink is prohibited.'
  },
  {
    number: '06',
    title: 'Technical Disclaimer & Accuracy',
    content: 'Software frameworks and cloud APIs evolve continuously. While our authors make every effort to test and verify instructions at the time of writing, materials are provided on an "as is" and "as available" basis without warranties of uninterrupted uptime or production fitness.'
  },
  {
    number: '07',
    title: 'Limitation of Liability',
    content: 'In no event will TechBlog, its authors, or maintainers be liable for any indirect, incidental, or consequential damages resulting from following technical tutorials, deploying code snippets to production, or service interruptions.'
  },
  {
    number: '08',
    title: 'Third-Party Links & Tools',
    content: 'Our articles frequently reference external open-source packages, official documentation, GitHub repositories, and software tools. We do not control or assume responsibility for external third-party software or websites.'
  },
  {
    number: '09',
    title: 'Modifications to Terms',
    content: 'We reserve the right to revise these Terms to reflect platform enhancements or regulatory changes. Continued use of TechBlog following updates constitutes your acceptance of the revised conditions.'
  },
  {
    number: '10',
    title: 'Governing Law',
    content: 'These terms and conditions are governed by and construed in accordance with standard international internet commerce regulations and the laws of the United States.'
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Platform Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Terms of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Clear, transparent terms governing your use of TechBlog, our technical articles, open code snippets, and reader discussions.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Last reviewed: November 2026 &bull; Clear &amp; Human-readable</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Terms Grid Cards */}
          {termsSections.map((sec, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-2.5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center shrink-0">
                  {sec.number}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                  {sec.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed pl-10">
                {sec.content}
              </p>
            </div>
          ))}

          {/* Contact & Legal Inquiries Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Need Clarification on Legal Terms?</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Reach out to our legal and editorial team with licensing or reuse questions.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Contact Legal Desk
            </Link>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)] pt-4">
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy &rarr;
            </Link>
            <span>&bull;</span>
            <Link href="/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Cookie Policy &rarr;
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
