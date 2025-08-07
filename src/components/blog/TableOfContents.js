import React from 'react';

export default function TableOfContents({ content }) {
  // Extract headings from markdown content
  const headingRegex = /^(##+)\s+(.*)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(content))) {
    headings.push({
      level: match[1].length, // 2 for h2, 3 for h3
      text: match[2],
      id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  }
  if (headings.length === 0) return null;
  return (
    <nav className="mb-8 p-4 bg-muted rounded-lg">
      <h3 className="font-bold mb-2">Table of Contents</h3>
      <ul className="space-y-1">
        {headings.map((h, i) => (
          <li key={i} className={h.level === 2 ? 'ml-0' : 'ml-4'}>
            <a href={`#${h.id}`} className="hover:underline text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}