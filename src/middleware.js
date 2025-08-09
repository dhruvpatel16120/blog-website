import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow access to public pages and API routes
  if (pathname === '/' || 
      pathname.startsWith('/blog') || 
      pathname.startsWith('/api') ||
      pathname === '/admin/login') {
    return NextResponse.next();
  }

  // For admin routes (except login), check for admin session
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Admin routes are protected by client-side checks
    // The AdminSessionProvider will handle redirects
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
