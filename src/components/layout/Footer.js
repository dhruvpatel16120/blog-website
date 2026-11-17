import Link from 'next/link'
import { FaLinkedin, FaGithub, FaEnvelope, FaYoutube, FaDiscord } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    content: [
      { name: 'Latest Posts', href: '/blog' },
      { name: 'Popular Articles', href: '/blog?sort=views' },
      { name: 'Data Science & AI', href: '/categories/data-science-ai' },
      { name: 'Cybersecurity', href: '/categories/cybersecurity' },
      { name: 'Programming', href: '/categories/programming-languages' },
      { name: 'DevOps & Cloud', href: '/categories/devops-cloud' },
    ],
    community: [
      { name: 'Discord Community', href: 'https://discord.gg/techblog' },
      { name: 'GitHub Discussions', href: 'https://github.com/dhruvpatel16120/blog-website/community' },
      { name: 'Contributor Guide', href: '/contribute' },
      { name: 'Code of Conduct', href: '/conduct' },
      { name: 'Community Guidelines', href: '/guidelines' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Developer Tools', href: '/tools' }
    ]
  }

  const socialLinks = [
    { name: 'X', href: 'https://x.com/techblog', icon: FaXTwitter },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/techblog', icon: FaLinkedin },
    { name: 'GitHub', href: 'https://github.com/techblog', icon: FaGithub },
    { name: 'YouTube', href: 'https://youtube.com/@techblog', icon: FaYoutube },
    { name: 'Discord', href: 'https://discord.gg/techblog', icon: FaDiscord },
    { name: 'Email', href: 'mailto:hello@techblog.com', icon: FaEnvelope }
  ]

  return (
    <footer className="w-full relative overflow-hidden bg-[#070b14] text-gray-300 border-t border-indigo-950/80">
      {/* Top Gradient Accent Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      {/* Subtle Background Glowing Ambient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Social Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <Link href="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-black text-xl tracking-tight">TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  TechBlog
                </span>
                <span className="text-xs font-semibold text-gray-400 tracking-wide">
                  Tech News, Engineering & Tutorials
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 max-w-md">
              Your premier destination for deep dives into modern software engineering, AI & machine learning, cybersecurity, cloud architecture, and open source development.
            </p>

            {/* Stay Connected Card */}
            <div className="rounded-2xl p-4 bg-[#0d1322] border border-indigo-900/50 shadow-xs max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-wider !text-white mb-1.5 flex items-center gap-1.5" style={{ color: '#ffffff' }}>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="!text-white" style={{ color: '#ffffff' }}>Join the Community</span>
              </h4>
              <p className="text-xs text-gray-300 mb-2.5">
                Connect with thousands of developers and authors worldwide.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-300">
                <Link href="https://x.com/techblog" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition-colors">
                  X
                </Link>
                <span>·</span>
                <Link href="https://github.com/techblog" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition-colors">
                  GitHub
                </Link>
                <span>·</span>
                <Link href="https://linkedin.com/company/techblog" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition-colors">
                  LinkedIn
                </Link>
                <span>·</span>
                <Link href="https://discord.gg/techblog" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition-colors">
                  Discord
                </Link>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800/80 text-gray-300 border border-gray-700/60 hover:bg-gradient-to-br hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Content Column */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-950/80">
                <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider !text-white" style={{ color: '#ffffff' }}>
                  Content
                </h3>
              </div>
              <ul className="space-y-2.5">
                {footerLinks.content.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Column */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-950/80">
                <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider !text-white" style={{ color: '#ffffff' }}>
                  Community
                </h3>
              </div>
              <ul className="space-y-2.5">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-950/80">
                <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider !text-white" style={{ color: '#ffffff' }}>
                  Company
                </h3>
              </div>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {currentYear} TechBlog. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Built for Modern Developers
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
