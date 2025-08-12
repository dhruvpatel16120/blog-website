"use client"

import ClientHeader from './ClientHeader';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const Layout = ({ children, showSidebar = true, sidebarPosts = [], sidebarCategories = [], sidebarTags = [] }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <ClientHeader scrolled={scrolled} />
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="container-custom py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className={cn(
              'lg:col-span-12',
              showSidebar ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'
            )}>
              {children}
            </div>
            {/* Sidebar */}
            {showSidebar && (
              <div className="lg:col-span-4 xl:col-span-3">
                <Sidebar allPosts={sidebarPosts} categories={sidebarCategories} tags={sidebarTags} />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;