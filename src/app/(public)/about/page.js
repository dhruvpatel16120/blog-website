import React from 'react'
import { Button, Badge } from '@/components/ui'
import { 
  UserGroupIcon, 
  LightBulbIcon, 
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

// Mock team data
const team = [
  {
    name: 'John Doe',
    role: 'Founder & Lead Developer',
    bio: 'Full-stack developer with 8+ years of experience in React, Node.js, and modern web technologies.',
    avatar: '/api/placeholder/120/120',
    social: {
      twitter: '#',
      github: '#',
      linkedin: '#'
    },
    expertise: ['React', 'Next.js', 'TypeScript']
  },
  {
    name: 'Jane Smith',
    role: 'Senior Frontend Developer',
    bio: 'Passionate about creating beautiful, accessible, and performant user interfaces.',
    avatar: '/api/placeholder/120/120',
    social: {
      twitter: '#',
      github: '#',
      linkedin: '#'
    },
    expertise: ['React', 'CSS', 'UI/UX']
  },
  {
    name: 'Mike Johnson',
    role: 'Backend Developer',
    bio: 'Experienced in building scalable APIs and microservices with Node.js and cloud technologies.',
    avatar: '/api/placeholder/120/120',
    social: {
      twitter: '#',
      github: '#',
      linkedin: '#'
    },
    expertise: ['Node.js', 'Express', 'MongoDB']
  },
  {
    name: 'Sarah Wilson',
    role: 'DevOps Engineer',
    bio: 'Specialized in CI/CD pipelines, cloud infrastructure, and deployment automation.',
    avatar: '/api/placeholder/120/120',
    social: {
      twitter: '#',
      github: '#',
      linkedin: '#'
    },
    expertise: ['Docker', 'AWS', 'CI/CD']
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
      <section className="text-center py-16 lg:py-24 mb-16" style={{
        background: 'linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4">
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
            <Button size="lg">
              Join Our Community
            </Button>
            <Button variant="outline" size="lg">
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
              <div key={index} className="text-center p-6">
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
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
                  backgroundColor: 'var(--muted)'
                }}>
                  <span className="text-2xl font-bold" style={{ color: 'var(--muted-foreground)' }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
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
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={platform}
                    >
                      <span className="capitalize text-sm">{platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-16">
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
          <Button size="lg">
            Subscribe to Newsletter
          </Button>
          <Button variant="outline" size="lg">
            Follow Us on Twitter
          </Button>
        </div>
      </section>
    </>
  )
} 