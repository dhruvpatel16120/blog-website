import React from 'react'
import Image from 'next/image'
import { Button, Badge } from '@/components/ui'
import { 
  UserGroupIcon, 
  LightBulbIcon, 
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

// Team data with CDN images
const team = [
  {
    name: 'Aarav Shah',
    role: 'Founder & Lead Developer',
    bio: 'Full‑stack developer focused on product, performance, and developer experience.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    social: { twitter: 'https://twitter.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
    expertise: ['React', 'Next.js', 'TypeScript']
  },
  {
    name: 'Meera Patel',
    role: 'Senior Frontend Engineer',
    bio: 'Design‑system advocate crafting accessible, beautiful user interfaces.',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=160&h=160&fit=crop&crop=faces',
    social: { twitter: 'https://twitter.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
    expertise: ['UI/UX', 'Accessibility', 'Tailwind CSS']
  },
  {
    name: 'Vihaan Kumar',
    role: 'Backend Engineer',
    bio: 'Builds reliable APIs and data pipelines with a security‑first mindset.',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop',
    social: { twitter: 'https://twitter.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
    expertise: ['Node.js', 'Prisma', 'PostgreSQL']
  },
  {
    name: 'Anaya Desai',
    role: 'DevOps & Cloud',
    bio: 'Automates everything. Cloud infra, CI/CD, and observability.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
    social: { twitter: 'https://twitter.com/', github: 'https://github.com/', linkedin: 'https://linkedin.com/' },
    expertise: ['Docker', 'AWS', 'Kubernetes']
  }
]

// Mock values/mission data
const values = [
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'We stay at the forefront of technology, exploring new tools and methodologies to deliver cutting-edge solutions.'
  },
  {
    icon: HeartIcon,
    title: 'Community',
    description: 'We believe in the power of knowledge sharing and building a supportive developer community.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Education',
    description: 'Our mission is to make complex technical concepts accessible to developers at all levels.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Accessibility',
    description: 'We create content and tools that are inclusive and accessible to everyone in the tech community.'
  }
]

// Mock stats
const stats = [
  { label: 'Articles Published', value: '150+' },
  { label: 'Community Members', value: '10K+' },
  { label: 'Years of Experience', value: '8+' },
  { label: 'Technologies Covered', value: '25+' }
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-600 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4">
          <Badge className="mb-6">About Us</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Building the Future of
            <span className="text-primary block">Web Development</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;re a passionate team of developers, designers, and tech enthusiasts dedicated to sharing knowledge, 
            exploring new technologies, and helping developers build amazing web applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="a" href="/contribute" size="lg">
              Join Our Community
            </Button>
            <Button as="a" href="#story" variant="outline" size="lg">
              Read Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Our Mission
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              To empower developers with the knowledge, tools, and community they need to build exceptional web experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {value.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold mb-2 text-primary">
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Meet Our Team
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              We&apos;re a diverse team of passionate developers and tech enthusiasts committed to sharing knowledge and building amazing things.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-2 ring-primary/20">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={96}
                    height={96}
                    sizes="96px"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                  {member.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--primary)' }}>
                  {member.role}
                </p>
                
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  {member.bio}
                </p>

                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {member.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-center space-x-3">
                  {Object.entries(member.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      className="text-muted-foreground hover:text-foreground transition-colors underline text-sm"
                      aria-label={platform}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="capitalize">{platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Our Story
              </h2>
              <div className="space-y-4" style={{ color: 'var(--muted-foreground)' }}>
                <p>
                  Founded in 2020, TechBlog started as a small community of developers passionate about sharing knowledge 
                  and exploring the latest web technologies. What began as a simple blog has grown into a comprehensive 
                  platform for developers worldwide.
                </p>
                <p>
                  We believe that the best way to learn is by doing and sharing. Our team writes from real-world experience, 
                  tackling the challenges we face in our own projects and sharing the solutions we discover.
                </p>
                <p>
                  Today, we&apos;re proud to serve a global community of developers, from beginners taking their first steps 
                  in web development to experienced professionals looking to stay current with the latest trends and tools.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-64 rounded-2xl flex items-center justify-center" style={{
                backgroundColor: 'var(--muted)'
              }}>
                <RocketLaunchIcon className="w-24 h-24" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center rounded-2xl p-8 lg:p-12" style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Join Our Community
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Connect with fellow developers, share your knowledge, and stay updated with the latest in web development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as="a" href="/contribute" size="lg">
            Start Contributing
          </Button>
          <Button as="a" href="/contact" variant="outline" size="lg">
            Contact Us
          </Button>
        </div>
      </section>
    </>
  )
} 