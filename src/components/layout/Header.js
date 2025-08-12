"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BookOpenIcon,
  HomeIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  TagIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Button, Dropdown } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import { useSession } from 'next-auth/react'
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'

const Header = ({ scrolled = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileMobileOpen, setIsProfileMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Blog', href: '/blog', icon: BookOpenIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
    { name: 'Contact', href: '/contact', icon: EnvelopeIcon }
  ]

  const userMenuItems = [
    { label: 'Profile', icon: <FaUserCircle />, onClick: () => router.push('/profile') },
    { label: 'Logout', icon: <FaSignOutAlt />, onClick: () => router.push('/auth/signout') }
  ]

  const avatarContent = () => {
    const initial = (user?.fullName || user?.username || user?.email || 'U').charAt(0).toUpperCase()
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
        />
      )
    }
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{initial}</span>
      </div>
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isActive = (href) => href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-200 w-full border-b",
        scrolled ? "shadow-md" : "shadow-sm"
      )}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="container-custom w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 w-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-lg">TB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight transition-colors" style={{ color: 'var(--foreground)' }}>
                  TechBlog
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
                  Tech News & Tutorials
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 mx-1 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1.5 hover:bg-muted hover:text-foreground",
                  isActive(item.href) ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Auth-aware action: show Sign In or User Menu */}
            {!isAuthenticated ? (
              <button
                onClick={() => router.push('/auth/signin')}
                className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors
                           border-indigo-500 text-indigo-400/90 bg-transparent
                           hover:bg-indigo-500 hover:text-white"
                aria-label="Sign In"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <Dropdown
                variant="unstyled"
                trigger={
                  <div className="flex items-center space-x-2 cursor-pointer ml-2 px-2 py-1.5 rounded-full transition-colors hover:bg-muted">
                    {avatarContent()}
                    <span className="text-sm font-medium text-muted-foreground hidden xl:block max-w-[160px] truncate">
                      {user?.fullName || user?.username || user?.email}
                    </span>
                  </div>
                }
                items={userMenuItems}
                align="right"
              />
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-1">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-400"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 py-4">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search articles, tutorials, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 pl-12 pr-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5"
                disabled={!searchQuery.trim()}
              >
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2 text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                ESC
              </div>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className={cn(
          'lg:hidden transition-all duration-300 overflow-hidden',
          isMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="px-2 pt-2 pb-6 space-y-1 border-t border-gray-200 dark:border-gray-700">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 text-base font-medium rounded-lg transition-colors duration-200 hover:bg-muted",
                  isActive(item.href) ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              {!isAuthenticated ? (
                <button
                  onClick={() => { setIsMenuOpen(false); router.push('/auth/signin'); }}
                  className="w-full justify-center inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors border-indigo-500 text-indigo-400/90 bg-transparent hover:bg-indigo-500 hover:text-white"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              ) : (
                <div>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsProfileMobileOpen((v) => !v)}
                    aria-expanded={isProfileMobileOpen}
                    aria-controls="mobile-profile-menu"
                  >
                    <div className="flex items-center gap-2">
                      {avatarContent()}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {user?.fullName || user?.username || user?.email}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMobileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                  </button>
                  <div
                    id="mobile-profile-menu"
                    className={cn(
                      'ml-2 mt-1 mb-2 grid grid-rows-[0fr] transition-all duration-300',
                      isProfileMobileOpen && 'grid-rows-[1fr]'
                    )}
                  >
                    <div className="overflow-hidden flex flex-col">
                      <button
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => { setIsMenuOpen(false); router.push('/profile'); }}
                      >
                        <span className="inline-flex items-center gap-2"><FaUserCircle /> Profile</span>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-red-600 dark:text-red-400"
                        onClick={() => { setIsMenuOpen(false); router.push('/auth/signout'); }}
                      >
                        <span className="inline-flex items-center gap-2"><FaSignOutAlt /> Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header