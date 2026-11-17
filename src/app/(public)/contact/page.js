"use client";

import React from 'react';
import Link from 'next/link';
import { 
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/forms/ContactForm';

const faqs = [
  {
    question: "How can I contribute to the blog?",
    answer: "We welcome guest contributions! Reach out through our contact form with your topic pitch or draft, and our editorial team will get back to you within 24 to 48 hours."
  },
  {
    question: "Do you offer technical consulting services?",
    answer: "Yes, our core team provides technical advisory and system architecture consultations for software projects. Drop us a note with your requirements."
  },
  {
    question: "How often do you publish new engineering content?",
    answer: "We publish high-quality in-depth tutorials and deep dives 2-3 times per week covering AI, fullstack web development, and cloud systems."
  },
  {
    question: "Can I request a specific topic to be covered?",
    answer: "Definitely! Community feedback shapes our content roadmap. Send us your topic suggestion using the category 'Content & Guest Posts'."
  },
  {
    question: "How can I report a bug or issue on the website?",
    answer: "Select 'Bug Report & Feedback' in the contact form, and our engineering team will inspect the issue immediately."
  }
];

const stats = [
  { label: 'Avg Response Time', value: '< 24h', icon: ClockIcon, color: 'text-blue-500' },
  { label: 'Delivery Rate', value: '99.9%', icon: CheckCircleIcon, color: 'text-emerald-500' },
  { label: 'Reader Rating', value: '4.9/5', icon: StarIcon, color: 'text-amber-500' },
  { label: 'Support Queue', value: '24/7', icon: ShieldCheckIcon, color: 'text-indigo-500' }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Get In Touch</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Let&apos;s Build &amp; Innovate{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Have questions, feedback, or a partnership opportunity? Send us a note. Our team responds promptly via automated email queues.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center"
              >
                <s.icon className={`w-6 h-6 ${s.color} mb-1`} />
                <span className="text-xl font-black text-[var(--foreground)]">{s.value}</span>
                <span className="text-[11px] font-medium text-[var(--muted-foreground)]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Form + Sidebar Info */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Contact Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Information Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Channels Card */}
              <div className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                    <span>Direct Channels</span>
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Connect directly with our editorial and support leads.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--foreground)]">Email Support</h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Inquiries, partnerships & feedback</p>
                      <a href="mailto:hello@techblog.com" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
                        hello@techblog.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--foreground)]">Direct Line</h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Mon–Fri, 9am–6pm EST</p>
                      <a href="tel:+1-555-123-4567" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Details Card */}
              <div className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-indigo-500" />
                  <span>Headquarters</span>
                </h3>

                <div className="space-y-3 text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-start gap-2.5">
                    <MapPinIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-[var(--foreground)] font-semibold">TechBlog Media Inc.</strong><br />
                      123 Tech Street, Suite 400<br />
                      San Francisco, CA 94105, United States
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--border)]">
                    <ClockIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-[var(--foreground)] font-semibold">Active Hours:</strong><br />
                      Monday to Friday: 9:00 AM – 6:00 PM EST<br />
                      Weekends: Emergency &amp; Security on-call
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Legal Links */}
              <div className="rounded-2xl p-5 border border-[var(--border)] bg-[var(--card)] shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-3 flex items-center gap-1.5">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                  <span>Helpful Resources</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link href="/privacy" className="text-[var(--muted-foreground)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Privacy Policy →
                  </Link>
                  <Link href="/terms" className="text-[var(--muted-foreground)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Terms of Service →
                  </Link>
                  <Link href="/cookies" className="text-[var(--muted-foreground)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Cookie Policy →
                  </Link>
                  <Link href="/guidelines" className="text-[var(--muted-foreground)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Guidelines →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-[var(--border)] bg-[var(--muted)]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Find quick answers about our articles, submissions, and services.
            </p>
          </div>
          
          <div className="space-y-3.5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] shadow-xs transition-shadow hover:shadow-sm"
              >
                <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] mb-2 flex items-start gap-2.5">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed pl-6.5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
