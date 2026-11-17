"use client";

import React, { useState } from 'react';
import { ListBulletIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function TableOfContents({ content }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!content || typeof content !== 'string') return null;

  const headings = [];

  // Match Markdown headings (## H2, ### H3)
  const mdRegex = /^(##+)\s+(.*)$/gm;
  let match;
  while ((match = mdRegex.exec(content))) {
    const rawText = match[2].trim();
    headings.push({
      level: match[1].length,
      text: rawText,
      id: rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  }

  // If no markdown headings found, try matching HTML headings (<h2>...</h2>, <h3>...</h3>)
  if (headings.length === 0) {
    const htmlRegex = /<(h[2-3])[^>]*>(.*?)<\/\1>/gi;
    let htmlMatch;
    while ((htmlMatch = htmlRegex.exec(content))) {
      const level = parseInt(htmlMatch[1].substring(1), 10);
      const cleanText = htmlMatch[2].replace(/<[^>]*>/g, '').trim();
      if (cleanText) {
        headings.push({
          level,
          text: cleanText,
          id: cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });
      }
    }
  }

  if (headings.length === 0) return null;

  return (
    <nav className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--card-foreground)] shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-bold text-sm text-[var(--foreground)] cursor-pointer select-none"
      >
        <span className="flex items-center gap-2">
          <ListBulletIcon className="w-4 h-4 text-blue-500" />
          Table of Contents
          <span className="text-xs font-normal text-[var(--muted-foreground)]">({headings.length} sections)</span>
        </span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
        )}
      </button>

      {isOpen && (
        <ul className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5 text-xs sm:text-sm">
          {headings.map((h, i) => (
            <li
              key={i}
              className={`${h.level > 2 ? 'pl-4 border-l-2 border-[var(--border)] ml-1' : ''}`}
            >
              <a
                href={`#${h.id}`}
                className="block py-0.5 text-[var(--muted-foreground)] hover:text-blue-500 hover:underline transition-colors truncate"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
