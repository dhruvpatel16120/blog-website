"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeSlashIcon, 
  ServerIcon, 
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Privacy &amp; Data Security</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Privacy{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            We respect your privacy as fundamentally as software quality. We do not sell your personal data or run intrusive trackers. Here is our straightforward policy.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Last revised: November 2026 &bull; Strict GDPR / CCPA alignment</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section 1: Introduction */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <LockClosedIcon className="w-4 h-4" />
              </div>
              <span>1. Overview &amp; Our Philosophy</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              At TechBlog, we build technical resources for developers. We are funded by reader engagement and community support, not by harvesting or selling user dossiers. When you read an article or leave a comment, your data is handled with production-grade encryption and minimized storage.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ServerIcon className="w-4 h-4" />
              </div>
              <span>2. Information We Collect</span>
            </h2>

            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  <span>Information You Provide Voluntarily</span>
                </h3>
                <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-disc pl-5 leading-relaxed">
                  <li><strong>Account Details:</strong> When you register an account, we store your name, email, and encrypted password hash (bcrypt salted).</li>
                  <li><strong>Comments &amp; Discussions:</strong> Any thoughts, code examples, or feedback submitted in comment forms.</li>
                  <li><strong>Contact Inquiries:</strong> Name, email address, topic category, and message body when using our contact form.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  <span>Telemetry &amp; Automatic Logs</span>
                </h3>
                <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-disc pl-5 leading-relaxed">
                  <li><strong>Server Logs:</strong> Anonymized HTTP request headers, response latency, and generalized client user-agent strings for uptime monitoring.</li>
                  <li><strong>Security &amp; Abuse Prevention:</strong> IP addresses are temporarily logged to detect DDoS attacks, automated bots, and comment spam.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              3. How We Use Your Information
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              We process data solely for the following legitimate purposes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-1">Serving Core Content:</strong>
                <span className="text-[var(--muted-foreground)]">Rendering articles, syntax highlighting, and personal bookmark lists.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-1">Delivering Inquiries:</strong>
                <span className="text-[var(--muted-foreground)]">Dispatching contact form messages and sending automated confirmations via email queue.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-1">Account Security:</strong>
                <span className="text-[var(--muted-foreground)]">Authenticating password resets, role-based admin controls, and token validation.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <strong className="text-[var(--foreground)] block mb-1">Continuous Optimization:</strong>
                <span className="text-[var(--muted-foreground)]">Fixing 404 links, monitoring server response times, and improving reading progress features.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Data Security */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                4. Data Security &amp; Storage Architecture
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Our infrastructure employs modern defense-in-depth principles:
            </p>

            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                <span><strong>Encryption in Transit:</strong> 100% of network traffic is encrypted via TLS 1.3 with automated HSTS enforcement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                <span><strong>Encryption at Rest:</strong> PostgreSQL database records and queue payloads are stored in encrypted cloud storage volumes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                <span><strong>Zero Plaintext Passwords:</strong> Passwords undergo salted hashing using strong bcrypt work factors.</span>
              </li>
            </ul>
          </div>

          {/* Section 5: Your Rights */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <EyeSlashIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                5. Your Data Rights &amp; Control
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Regardless of your geographic location, we respect your rights under modern privacy frameworks (including GDPR, CCPA, and CPRA):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-1">Right to Access</strong>
                <span className="text-[var(--muted-foreground)]">Request an export of all information associated with your account or email.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-1">Right to Erasure</strong>
                <span className="text-[var(--muted-foreground)]">Request total deletion of your profile, comment history, and stored contact inquiries.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <strong className="text-[var(--foreground)] block mb-1">Right to Rectify</strong>
                <span className="text-[var(--muted-foreground)]">Update your profile credentials or correct any inaccurate personal details anytime.</span>
              </div>
            </div>
          </div>

          {/* Section 6: Contact & Inquiries */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Exercise Your Privacy Rights</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                To request data deletion, export, or ask questions, send a note directly to our privacy officer.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Contact Privacy Team
            </Link>
          </div>

          {/* Related Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)] pt-4">
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service &rarr;
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
