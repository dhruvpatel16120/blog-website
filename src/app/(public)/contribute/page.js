import React from 'react'
import { Badge } from '@/components/ui'

export default function ContributePage() {
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
            Contributor Guide
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Guidelines for contributing to TechBlog and making our project better together.
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
              <h2>How to Contribute</h2>
              <ol>
                <li>Fork the repository and create your branch from <code>main</code>.</li>
                <li>Make your changes with clear, descriptive commit messages.</li>
                <li>Ensure your code follows our code style and passes all tests.</li>
                <li>Submit a pull request with a clear description of your changes.</li>
              </ol>
            </div>
            <div>
              <h2>Code Style</h2>
              <ul>
                <li>Use consistent indentation and formatting (see <code>.editorconfig</code> and <code>eslint</code> rules).</li>
                <li>Write clear, self-documenting code and add comments where necessary.</li>
                <li>Use descriptive variable and function names.</li>
              </ul>
            </div>
            <div>
              <h2>Pull Requests</h2>
              <ul>
                <li>Reference related issues in your PR description (e.g., &quot;Closes #123&quot;).</li>
                <li>Describe what your PR changes and why.</li>
                <li>Be responsive to feedback and make requested changes promptly.</li>
              </ul>
            </div>
            <div>
              <h2>Reporting Issues</h2>
              <ul>
                <li>Search existing issues before opening a new one.</li>
                <li>Provide a clear, descriptive title and detailed information.</li>
                <li>Include screenshots or error logs if relevant.</li>
              </ul>
            </div>
            <div>
              <h2>Community</h2>
              <ul>
                <li>Be respectful and inclusive in all interactions.</li>
                <li>Follow our <a href="/conduct">Code of Conduct</a> and <a href="/guidelines">Community Guidelines</a>.</li>
              </ul>
            </div>
            <div>
              <h2>Resources</h2>
              <ul>
                <li><a href="https://github.com/dhruvpatel16120/blog-website">GitHub Repository</a></li>
                <li><a href="https://github.com/dhruvpatel16120/blog-website/discussions">GitHub Discussions</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
