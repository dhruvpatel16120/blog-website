import React from 'react'
import { Badge } from '@/components/ui'

export default function ConductPage() {
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
            Code of Conduct
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Our pledge to foster a welcoming and inclusive community for everyone.
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
              <h2>Our Pledge</h2>
              <p>We pledge to make participation in our project and community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.</p>
            </div>
            <div>
              <h2>Our Standards</h2>
              <ul>
                <li>Use welcoming and inclusive language</li>
                <li>Be respectful of differing viewpoints and experiences</li>
                <li>Gracefully accept constructive criticism</li>
                <li>Focus on what is best for the community</li>
                <li>Show empathy towards other community members</li>
              </ul>
            </div>
            <div>
              <h2>Our Responsibilities</h2>
              <p>Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.</p>
            </div>
            <div>
              <h2>Scope</h2>
              <p>This Code of Conduct applies within all project spaces and in public spaces when an individual is representing the project or its community.</p>
            </div>
            <div>
              <h2>Enforcement</h2>
              <p>Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at <a href="mailto:hello@techblog.com">hello@techblog.com</a>. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.</p>
            </div>
            <div>
              <h2>Contact</h2>
              <p>If you have questions or concerns, please contact us at <a href="mailto:hello@techblog.com">hello@techblog.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
