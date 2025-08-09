import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    
    // Check if user is trying to access admin routes
    if (isAdminRoute) {
      // If no token or user is not admin, redirect to signin
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and public routes
        if (req.nextUrl.pathname.startsWith('/auth') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/blog') ||
            req.nextUrl.pathname.startsWith('/categories') ||
            req.nextUrl.pathname.startsWith('/tags') ||
            req.nextUrl.pathname.startsWith('/search') ||
            req.nextUrl.pathname.startsWith('/about') ||
            req.nextUrl.pathname.startsWith('/contact')) {
          return true;
        }
        
        // For admin routes, require authentication
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'ADMIN';
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
