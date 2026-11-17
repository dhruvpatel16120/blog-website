"use client"

import { useState } from 'react'
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
  ArrowRightIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Dropdown } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'

const Header = ({ scrolled = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileMobileOpen, setIsProfileMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
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
    { label: 'Public Profile', icon: <FaUserCircle />, onClick: () => router.push('/profile') },
    { label: 'Profile Settings', icon: <Cog6ToothIcon className="w-4 h-4" />, onClick: () => router.push('/profile/settings') },
    ...(user?.role === 'ADMIN' || user?.type === 'admin'
      ? [{ label: 'Admin Dashboard', icon: <UserIcon className="w-4 h-4" />, onClick: () => router.push('/admin') }]
      : []),
    { label: 'Logout', icon: <FaSignOutAlt />, onClick: () => router.push('/auth/signout') }
  ]

  const avatarContent = () => {
    const avatarUrl = user?.avatar || (user ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username || user.fullName || "user")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` : null)
    if (avatarUrl) {
      return (
        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xs">
          <Image
            src={avatarUrl}
            alt="avatar"
            width={34}
            height={34}
            className="w-8 h-8 rounded-full object-cover bg-white dark:bg-gray-900 border border-white dark:border-gray-900"
            unoptimized
          />
        </div>
      )
    }
    const initial = (user?.fullName || user?.username || user?.email || 'U').charAt(0).toUpperCase()
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
        <span className="text-xs font-bold">{initial}</span>
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
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Gradient Accent Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      {/* Main Navbar Bar: Light theme uses vibrant blue theme, Dark theme uses deep night palette */}
      <div
        className={cn(
          "w-full backdrop-blur-md transition-all duration-200 border-b",
          scrolled
            ? "bg-blue-50/95 dark:bg-[#0b0f19]/90 shadow-md shadow-blue-500/10 border-blue-200/90 dark:border-indigo-950/80"
            : "bg-blue-50/90 dark:bg-[#0b0f19]/80 shadow-xs border-blue-200/70 dark:border-gray-800/70"
        )}
      >
        <div className="container-custom w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 w-full">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-extrabold text-lg tracking-tight">TB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent transition-all">
                    TechBlog
                  </span>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-indigo-400 animate-pulse" />
                    <span className="text-[11px] font-medium text-blue-900/70 dark:text-gray-400">
                      Tech News & Tutorials
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-2 mx-0.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 relative group",
                      active
                        ? "text-white bg-blue-600 shadow-sm font-semibold dark:bg-gradient-to-r dark:from-blue-500/20 dark:to-purple-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/30"
                        : "text-blue-950/80 hover:text-blue-600 hover:bg-blue-100/70 dark:text-gray-300 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/40"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 transition-colors", active ? "text-white dark:text-indigo-300" : "text-blue-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-indigo-400")} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2.5">
              {/* Search Toggle Button */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-xl transition-all duration-200 text-blue-900/80 hover:text-blue-600 hover:bg-blue-100/70 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50 cursor-pointer"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl transition-all duration-200 text-blue-900/80 hover:text-blue-600 hover:bg-blue-100/70 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50 cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-amber-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-blue-700" />
                )}
              </button>

              {/* Auth Button: Sign In or User Menu */}
              {!isAuthenticated ? (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white 
                             bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 
                             shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              ) : (
                <Dropdown
                  variant="unstyled"
                  trigger={
                    <div className="flex items-center space-x-2.5 cursor-pointer ml-1 px-2.5 py-1.5 rounded-full transition-all bg-blue-100/60 hover:bg-blue-200/60 dark:bg-transparent dark:hover:bg-indigo-950/40 border border-blue-200/60 dark:border-indigo-800/50">
                      {avatarContent()}
                      <span className="text-sm font-semibold text-blue-950 dark:text-gray-200 hidden xl:block max-w-[140px] truncate">
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
            <div className="flex lg:hidden items-center space-x-1.5">
              {/* Search */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-xl transition-colors text-blue-900/80 hover:text-blue-600 hover:bg-blue-100/70 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-colors text-blue-900/80 hover:text-blue-600 hover:bg-blue-100/70 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-amber-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-blue-700" />
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 ml-1 rounded-xl text-blue-900 dark:text-gray-300 hover:bg-blue-100/80 dark:hover:bg-indigo-950/50 transition-all duration-200"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-blue-600 dark:text-indigo-400" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Theme-Aware Search Bar */}
          {isSearchOpen && (
            <div className="border-t border-blue-200 dark:border-indigo-950/80 py-4 animate-in fade-in duration-200">
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search articles, topics, tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 pl-12 pr-24 text-sm rounded-xl border border-blue-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-blue-400/80 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-indigo-500/40 focus:border-blue-600 dark:focus:border-indigo-500 shadow-sm transition-all"
                  autoFocus
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-indigo-400" />
                <button 
                  type="submit" 
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Go</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-gray-300 hidden sm:block">
                  ESC
                </div>
              </form>
            </div>
          )}

          {/* Mobile Navigation Drawer */}
          <div className={cn(
            'lg:hidden transition-all duration-300 overflow-hidden',
            isMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <div className="px-2 pt-3 pb-6 space-y-1.5 border-t border-blue-200 dark:border-indigo-950/80">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3.5 py-3 text-base font-medium rounded-xl transition-all duration-200",
                      active 
                        ? "text-white bg-blue-600 font-semibold shadow-sm dark:bg-gradient-to-r dark:from-blue-500/15 dark:to-purple-500/15 dark:text-indigo-300 dark:border dark:border-indigo-500/20" 
                        : "text-blue-950/90 dark:text-gray-300 hover:bg-blue-100/70 dark:hover:bg-indigo-950/40 hover:text-blue-700 dark:hover:text-indigo-300"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={cn("w-5 h-5", active ? "text-white dark:text-indigo-300" : "text-blue-500 dark:text-gray-400")} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              <div className="pt-3 mt-3 border-t border-blue-200 dark:border-indigo-950/80">
                {!isAuthenticated ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); router.push('/auth/signin'); }}
                    className="w-full justify-center inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In to Your Account</span>
                  </button>
                ) : (
                  <div>
                    <button
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-100/60 dark:bg-gray-800/60 hover:bg-blue-100 dark:hover:bg-indigo-950/50 transition-colors"
                      onClick={() => setIsProfileMobileOpen((v) => !v)}
                      aria-expanded={isProfileMobileOpen}
                      aria-controls="mobile-profile-menu"
                    >
                      <div className="flex items-center gap-3">
                        {avatarContent()}
                        <div className="text-left">
                          <p className="text-sm font-semibold text-blue-950 dark:text-white truncate">
                            {user?.fullName || user?.username}
                          </p>
                          <p className="text-xs text-blue-900/60 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <svg className={`w-4 h-4 text-blue-700 dark:text-gray-400 transition-transform duration-200 ${isProfileMobileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div
                      id="mobile-profile-menu"
                      className={cn(
                        'ml-2 mt-1 mb-2 grid grid-rows-[0fr] transition-all duration-300',
                        isProfileMobileOpen && 'grid-rows-[1fr]'
                      )}
                    >
                      <div className="overflow-hidden flex flex-col space-y-1 pt-1">
                        <button
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-blue-100/70 dark:hover:bg-indigo-950/40 text-sm font-medium text-blue-950 dark:text-gray-300 flex items-center gap-2.5"
                          onClick={() => { setIsMenuOpen(false); router.push('/profile'); }}
                        >
                          <FaUserCircle className="text-blue-600 dark:text-indigo-500" />
                          <span>Public Profile</span>
                        </button>
                        <button
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-blue-100/70 dark:hover:bg-indigo-950/40 text-sm font-medium text-blue-950 dark:text-gray-300 flex items-center gap-2.5"
                          onClick={() => { setIsMenuOpen(false); router.push('/profile/settings'); }}
                        >
                          <Cog6ToothIcon className="w-4 h-4 text-blue-600 dark:text-indigo-500" />
                          <span>Profile Settings</span>
                        </button>
                        {(user?.role === 'ADMIN' || user?.type === 'admin') && (
                          <button
                            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-blue-100/70 dark:hover:bg-indigo-950/40 text-sm font-semibold text-blue-700 dark:text-indigo-400 flex items-center gap-2.5"
                            onClick={() => { setIsMenuOpen(false); router.push('/admin'); }}
                          >
                            <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}
                        <button
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2.5"
                          onClick={() => { setIsMenuOpen(false); router.push('/auth/signout'); }}
                        >
                          <FaSignOutAlt className="text-red-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
