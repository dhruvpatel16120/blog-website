"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track views for specific pages
    const shouldTrackView = () => {
      const trackablePages = ['/', '/blog', '/about', '/categories'];
      const isTrackablePage = trackablePages.includes(pathname);
      const isPostPage = pathname.startsWith('/blog/') && pathname.split('/').length === 2;
      
      return isTrackablePage || isPostPage;
    };

    if (shouldTrackView()) {
      // Track the page view
      fetch('/api/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pagePath: pathname,
        }),
      }).catch(error => {
        console.error('Error tracking page view:', error);
      });
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
