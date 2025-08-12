import Link from 'next/link'
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope, FaYoutube, FaDiscord } from 'react-icons/fa'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Newsletter subscription logic would go here
    console.log('Newsletter subscription')
  }

  const footerLinks = {
    content: [
      { name: 'Latest Posts', href: '/blog' },
      { name: 'Popular Articles', href: '/blog?sort=popular' },
      { name: 'Tutorials', href: '/categories/tutorials' },
      { name: 'Tech News', href: '/categories/news' },
      { name: 'Programming', href: '/categories/programming' }
    ],
    community: [
      { name: 'Discord Server', href: 'https://discord.gg/techblog' },
      { name: 'GitHub Discussions', href: 'https://github.com/dhruvpatel16120/blog-website/community' },
      { name: 'Contributor Guide', href: '/contribute' },
      { name: 'Code of Conduct', href: '/conduct' },
      { name: 'Community Guidelines', href: '/guidelines' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Contact', href: '/contact' },
      { name: 'Tools & Resources', href: '/tools' }
    ]
  }

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/techblog', icon: FaTwitter },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/techblog', icon: FaLinkedin },
    { name: 'GitHub', href: 'https://github.com/techblog', icon: FaGithub },
    { name: 'YouTube', href: 'https://youtube.com/@techblog', icon: FaYoutube },
    { name: 'Discord', href: 'https://discord.gg/techblog', icon: FaDiscord },
    { name: 'Email', href: 'mailto:hello@techblog.com', icon: FaEnvelope }
  ]

  return (
    <footer className="w-full border-t" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
      <div className="w-full py-8 px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Newsletter */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>TechBlog</span>
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Tech News & Tutorials</span>
              </div>
            </div>
            <p className="mb-1 text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Your go-to destination for the latest in technology, programming tutorials, and digital innovation. Stay ahead with our expert insights and practical guides.
            </p>
            {/* Newsletter Signup */}
            <div className="rounded-2xl shadow-lg p-4 mb-1 flex flex-col gap-2" style={{ backgroundColor: 'var(--muted)' }}>
              <h3 className="text-base font-bold mb-2" style={{ color: 'var(--foreground)' }}>Stay updated with our newsletter</h3>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1"
                  required
                />
                <Button type="submit" className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 shadow-md">
                  Subscribe
                </Button>
              </form>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Get weekly updates on the latest tech trends and tutorials. No spam, unsubscribe anytime.
              </p>
            </div>
            {/* Social Links */}
            <div className="flex space-x-3 mt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-500 text-gray-300 hover:text-white shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold mb-3 pb-1 border-b border-gray-700 text-white tracking-wide uppercase">Content</h3>
            <ul className="space-y-2 mt-4">
              {footerLinks.content.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-all duration-200 text-sm font-medium hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold mb-3 pb-1 border-b tracking-wide uppercase" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Community</h3>
            <ul className="space-y-2 mt-4">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-all duration-200 text-sm font-medium hover:text-primary hover:translate-x-1 inline-block"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold mb-3 pb-1 border-b tracking-wide uppercase" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Company</h3>
            <ul className="space-y-2 mt-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-all duration-200 text-sm font-medium hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 w-full" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 w-full">
            <div className="text-sm text-center md:text-left" style={{ color: 'var(--muted-foreground)' }}>
              © {currentYear} TechBlog. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm justify-center md:justify-end w-full md:w-auto">
              <Link href="/privacy" className="hover:text-primary transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer