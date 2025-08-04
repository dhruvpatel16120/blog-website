import Link from 'next/link'
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'
import { Button, Input } from '@/components/ui'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api' },
      { name: 'Documentation', href: '/docs' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Status', href: '/status' },
      { name: 'Security', href: '/security' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' }
    ]
  }

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: FaTwitter },
    { name: 'LinkedIn', href: '#', icon: FaLinkedin },
    { name: 'GitHub', href: '#', icon: FaGithub },
    { name: 'Email', href: 'mailto:contact@techblog.com', icon: FaEnvelope }
  ]

  return (
    <footer className="text-white" style={{
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)'
    }}>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="text-xl font-bold">TechBlog</span>
            </div>
                         <p className="mb-6 max-w-md" style={{ color: 'var(--muted-foreground)' }}>
               A modern tech blog platform built with Next.js and Tailwind CSS. 
               Discover the latest in technology, programming, and digital innovation.
             </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Subscribe to our newsletter</h3>
              <div className="flex space-x-2">
                                 <Input
                   type="email"
                   placeholder="Enter your email"
                   className="flex-1"
                   style={{
                     backgroundColor: 'var(--muted)',
                     borderColor: 'var(--border)',
                     color: 'var(--foreground)'
                   }}
                 />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="transition-colors text-muted-foreground hover:text-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              © {currentYear} TechBlog. All rights reserved.
            </div>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 