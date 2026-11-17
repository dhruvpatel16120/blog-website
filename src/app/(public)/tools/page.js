"use client";

import React from 'react';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon, 
  CommandLineIcon, 
  CodeBracketIcon, 
  PaintBrushIcon, 
  BriefcaseIcon, 
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const sections = [
  {
    title: 'Editor & IDEs',
    icon: CommandLineIcon,
    color: 'text-blue-500 bg-blue-500/10',
    description: 'Core developer environments optimized for TypeScript, Python, and full-stack development.',
    items: [
      { name: 'VS Code', desc: 'Lightweight, versatile open-source code editor with an unmatched ecosystem of extensions.', link: 'https://code.visualstudio.com/' },
      { name: 'WebStorm', desc: 'Deeply integrated IDE for TypeScript, JavaScript, and complex web architecture by JetBrains.', link: 'https://www.jetbrains.com/webstorm/' },
      { name: 'Cursor', desc: 'AI-first code editor built on VS Code with context-aware repository intelligence.', link: 'https://www.cursor.com/' },
    ],
  },
  {
    title: 'Libraries & Frameworks',
    icon: CodeBracketIcon,
    color: 'text-indigo-500 bg-indigo-500/10',
    description: 'Production-ready frameworks and UI toolkits we utilize to ship performant web apps.',
    items: [
      { name: 'Next.js', desc: 'The React framework for high-performance server-side rendering, routing, and APIs.', link: 'https://nextjs.org/' },
      { name: 'React', desc: 'Declarative component library for building modular, interactive user interfaces.', link: 'https://react.dev/' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling system that allows rapid design systems without CSS bloat.', link: 'https://tailwindcss.com/' },
      { name: 'Prisma ORM', desc: 'Next-generation TypeScript ORM providing end-to-end database type safety.', link: 'https://www.prisma.io/' },
    ],
  },
  {
    title: 'Design & UI Resources',
    icon: PaintBrushIcon,
    color: 'text-purple-500 bg-purple-500/10',
    description: 'Interface design platforms, iconography, and accessible color utilities.',
    items: [
      { name: 'Figma', desc: 'Industry-standard collaborative interface design and prototyping application.', link: 'https://figma.com/' },
      { name: 'Heroicons', desc: 'Meticulously crafted SVG icons designed by the creators of Tailwind CSS.', link: 'https://heroicons.com/' },
      { name: 'Coolors', desc: 'Superfast color scheme generator for harmonious visual palettes.', link: 'https://coolors.co/' },
    ],
  },
  {
    title: 'Engineering Productivity',
    icon: BriefcaseIcon,
    color: 'text-amber-500 bg-amber-500/10',
    description: 'Utilities for task tracking, API testing, technical specifications, and team sync.',
    items: [
      { name: 'Notion', desc: 'Flexible all-in-one workspace for technical architecture docs and team wikis.', link: 'https://notion.so/' },
      { name: 'Postman', desc: 'Complete API lifecycle platform for designing, mocking, and testing REST & GraphQL endpoints.', link: 'https://www.postman.com/' },
      { name: 'GitHub CLI', desc: 'Seamless command-line interface for pull requests, issues, and workflow actions.', link: 'https://cli.github.com/' },
    ],
  },
  {
    title: 'Learning & Technical References',
    icon: AcademicCapIcon,
    color: 'text-emerald-500 bg-emerald-500/10',
    description: 'Foundational references and interactive platforms for continuous technical growth.',
    items: [
      { name: 'MDN Web Docs', desc: 'The most authoritative documentation for web standards, JavaScript, and HTML5 APIs.', link: 'https://developer.mozilla.org/' },
      { name: 'Frontend Masters', desc: 'In-depth video courses taught by industry leads on advanced architecture and patterns.', link: 'https://frontendmasters.com/' },
      { name: 'Patterns.dev', desc: 'Free educational guide on design patterns, component architectures, and performance.', link: 'https://www.patterns.dev/' },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--border)] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6">
            <WrenchScrewdriverIcon className="w-4 h-4" />
            <span>Curated Developer Stack</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)] max-w-4xl mx-auto">
            Tools &amp;{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Resources
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mt-4 leading-relaxed">
            A handpicked directory of battle-tested editors, frameworks, libraries, and references we rely on daily to build and ship software.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-6 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Updated regularly by the TechBlog editorial team</span>
          </div>
        </div>
      </section>

      {/* Main Content: Cards Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {sections.map((sec) => (
              <div
                key={sec.title}
                className="rounded-2xl p-6 sm:p-7 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl ${sec.color} flex items-center justify-center shrink-0`}>
                      <sec.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                        {sec.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
                    {sec.description}
                  </p>

                  <div className="space-y-3">
                    {sec.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] hover:border-indigo-500/40 hover:bg-[var(--muted)]/70 transition-all flex items-start justify-between gap-3 group block"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.name}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggest a Resource Banner */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <span>Know a Great Tool We Missed?</span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Have an open-source utility, library, or book you recommend? Send us your recommendation.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-sm shadow-blue-500/25 transition-all duration-200 cursor-pointer shrink-0"
            >
              Suggest a Tool
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
