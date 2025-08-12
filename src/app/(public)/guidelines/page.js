import React from 'react'
import { Badge } from '@/components/ui'

export default function GuidelinesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16 rounded-2xl" style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.03)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Community</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Community Guidelines
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Best practices and expectations for participating in the TechBlog community.
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>
      {/* Content */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <div className="space-y-8">
            <div>
              <h2>Welcome</h2>
              <p>Welcome to the TechBlog community! We are excited to have you here. To keep our community healthy and productive, please follow these guidelines.</p>
            </div>
            <div>
              <h2>Be Respectful</h2>
              <ul>
                <li>Treat everyone with respect and kindness.</li>
                <li>Disagreement is okay, but do so politely and constructively.</li>
                <li>Harassment, discrimination, or abusive language will not be tolerated.</li>
              </ul>
            </div>
            <div>
              <h2>Stay On Topic</h2>
              <ul>
                <li>Keep discussions relevant to technology, programming, and the topics of this project.</li>
                <li>Use appropriate channels for off-topic conversations.</li>
              </ul>
            </div>
            <div>
              <h2>No Spam</h2>
              <ul>
                <li>Do not post spam, advertisements, or self-promotion without permission.</li>
                <li>Repeated violations may result in removal from the community.</li>
              </ul>
            </div>
            <div>
              <h2>Reporting Issues</h2>
              <ul>
                <li>If you see something inappropriate, report it to the maintainers or email <a href="mailto:hello@techblog.com">hello@techblog.com</a>.</li>
                <li>We take all reports seriously and will act as needed to keep the community safe.</li>
              </ul>
            </div>
            <div>
              <h2>Resources</h2>
              <ul>
                <li><a href="/conduct">Code of Conduct</a></li>
                <li><a href="/contribute">Contributor Guide</a></li>
                <li><a href="https://github.com/dhruvpatel16120/blog-website/discussions">GitHub Discussions</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
