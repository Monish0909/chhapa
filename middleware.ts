import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect routes under /admin
  if (pathname.startsWith('/admin')) {
    // Exclude the login page and authentication API routes
    if (
      pathname === '/admin/login' ||
      pathname.startsWith('/api/admin')
    ) {
      return NextResponse.next();
    }

    // Check for valid session cookie
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    const hasValidSession = sessionCookie && sessionCookie.value === 'authenticated';

    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      // Optional: keep return url if needed
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
