import React from 'react'
import { Badge } from '@/components/ui'

const sections = [
  {
    title: 'Editor & IDEs',
    items: [
      { name: 'VS Code', desc: 'Popular open-source code editor with rich extensions.', link: 'https://code.visualstudio.com/' },
      { name: 'WebStorm', desc: 'Powerful IDE for JavaScript and web development.', link: 'https://www.jetbrains.com/webstorm/' },
    ],
  },
  {
    title: 'Libraries & Frameworks',
    items: [
      { name: 'React', desc: 'A JavaScript library for building user interfaces.', link: 'https://react.dev/' },
      { name: 'Next.js', desc: 'The React framework for production.', link: 'https://nextjs.org/' },
      { name: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.', link: 'https://tailwindcss.com/' },
    ],
  },
  {
    title: 'Design & UI',
    items: [
      { name: 'Figma', desc: 'Collaborative interface design tool.', link: 'https://figma.com/' },
      { name: 'Heroicons', desc: 'Beautiful hand-crafted SVG icons.', link: 'https://heroicons.com/' },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { name: 'Notion', desc: 'All-in-one workspace for notes, tasks, and wikis.', link: 'https://notion.so/' },
      { name: 'Trello', desc: 'Visual tool for organizing tasks and projects.', link: 'https://trello.com/' },
    ],
  },
  {
    title: 'Learning Resources',
    items: [
      { name: 'MDN Web Docs', desc: 'Comprehensive resource for web developers.', link: 'https://developer.mozilla.org/' },
      { name: 'freeCodeCamp', desc: 'Learn to code for free.', link: 'https://freecodecamp.org/' },
      { name: 'Frontend Masters', desc: 'Advanced web development courses.', link: 'https://frontendmasters.com/' },
    ],
  },
]

export default function ToolsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Resources</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Tools & Resources
          </h1>
        </div>
      </section>

      {/* Cards Sections */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((sec) => (
              <article key={sec.title} className="rounded-2xl border shadow-sm p-6" style={{
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                borderColor: 'var(--border)'
              }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>{sec.title}</h2>
                <ul className="space-y-3">
                  {sec.items.map((item) => (
                    <li key={item.name} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <div>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: 'var(--primary)' }}>
                          {item.name}
                        </a>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
