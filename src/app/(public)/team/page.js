import React from 'react'
import Image from 'next/image'
import { Badge, Button } from '@/components/ui'
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa'

const team = [
  {
    name: 'John Doe',
    role: 'Founder & Lead Developer',
    bio: 'Full-stack developer focused on DX, performance, and elegant systems.',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=160&h=160&fit=crop&crop=faces',
    social: { twitter: '#', github: '#', linkedin: '#' }
  },
  {
    name: 'Jane Smith',
    role: 'Senior Frontend Engineer',
    bio: 'Design-systems enthusiast crafting delightful, accessible interfaces.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces',
    social: { twitter: '#', github: '#', linkedin: '#' }
  },
  {
    name: 'Mike Johnson',
    role: 'Backend Engineer',
    bio: 'APIs, databases, and scalable services that never skip a beat.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces',
    social: { twitter: '#', github: '#', linkedin: '#' }
  },
  {
    name: 'Sarah Wilson',
    role: 'DevOps Engineer',
    bio: 'Automation, CI/CD pipelines, and cloud-native reliability advocate.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces',
    social: { twitter: '#', github: '#', linkedin: '#' }
  }
]

export default function TeamPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <Badge className="mb-6">Company</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Our Team
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            A passionate group of builders, designers, and creators shaping the future of TechBlog.
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <article
                key={member.name}
                className="group rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center"
                style={{
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="w-28 h-28 rounded-full mb-4 overflow-hidden ring-2 ring-blue-600/20" style={{ background: 'var(--muted)' }}>
                  <Image src={member.avatar} alt={member.name} width={112} height={112} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">{member.role}</p>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{member.bio}</p>
                <div className="flex items-center gap-3">
                  <a href={member.social.twitter} aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                  <a href={member.social.github} aria-label="GitHub" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <FaGithub className="w-5 h-5" />
                  </a>
                  <a href={member.social.linkedin} aria-label="LinkedIn" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-2xl border p-8 text-center" style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderColor: 'var(--border)'
          }}>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Our Mission</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              We empower developers by delivering high-quality content, practical tools, and a welcoming community.
              We believe in clarity, craftsmanship, and continual learning.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
