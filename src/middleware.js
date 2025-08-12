import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected admin routes that require authentication
const PROTECTED_ADMIN_ROUTES = [
  '/admin',
  '/admin/posts',
  '/admin/users',
  '/admin/categories',
  '/admin/tags',
  '/admin/comments',
  '/admin/contacts',
  '/admin/files',
  // analytics and audit removed
  '/admin/settings'
];

// Admin API routes that require authentication
const PROTECTED_ADMIN_API_ROUTES = [
  '/api/admin'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to public pages and API routes (except admin)
  if (pathname === '/' || 
      pathname.startsWith('/blog') || 
      pathname.startsWith('/categories') ||
      pathname.startsWith('/tags') ||
      pathname.startsWith('/search') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/contact') ||
      pathname.startsWith('/team') ||
      pathname.startsWith('/guidelines') ||
      pathname.startsWith('/conduct') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/cookies') ||
      pathname.startsWith('/contribute') ||
      pathname.startsWith('/tools') ||
      pathname.startsWith('/auth') ||
      pathname === '/admin/login' ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/me') ||
      pathname.startsWith('/api/profile') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/categories') ||
      pathname.startsWith('/api/views')) {
    return NextResponse.next();
  }

  // Check if this is an admin route that needs protection
  const isProtectedAdminRoute = PROTECTED_ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  const isProtectedAdminApiRoute = PROTECTED_ADMIN_API_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Skip protection for admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (isProtectedAdminRoute || isProtectedAdminApiRoute) {
    try {
      // Get the JWT token from the request
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      // Check if user is authenticated and is an admin
      if (!token || token.type !== 'admin') {
        // For API routes, return 401
        if (isProtectedAdminApiRoute) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized - Admin access required' }),
            { 
              status: 401, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // For page routes, redirect to admin login
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'unauthorized');
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Check if admin account is still active
      if (!token.isActive) {
        if (isProtectedAdminApiRoute) {
          return new NextResponse(
            JSON.stringify({ error: 'Account deactivated' }),
            { 
              status: 403, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
        
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'account_deactivated');
        return NextResponse.redirect(url);
      }

      // Add admin info to headers for API routes
      if (isProtectedAdminApiRoute) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-admin-id', token.id);
        requestHeaders.set('x-admin-role', token.role);
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      
      if (isProtectedAdminApiRoute) {
        return new NextResponse(
          JSON.stringify({ error: 'Internal server error' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'server_error');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
