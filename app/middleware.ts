// c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that should NOT be protected by authentication
const publicPaths = [
  '/auth', // The authentication page itself
  // Add any other public paths here, e.g., '/about', '/contact', '/privacy-policy'
  // Be careful not to block essential Next.js assets or API routes needed for auth.
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next(); // Create a response object to pass to the Supabase client
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  // If the user is not authenticated
  if (!session) {
    // And they are trying to access a path that is NOT public and NOT an essential Next.js asset
    if (!publicPaths.includes(pathname) && 
        !pathname.startsWith('/_next/') && 
        !pathname.startsWith('/api/auth/') && // Allow Supabase auth API routes
        pathname !== '/favicon.ico' &&
        !pathname.startsWith('/static/')) { // Example if you have a /static folder for public assets
      console.log(`[Middleware] No session, redirecting from ${pathname} to /auth`);
      return NextResponse.redirect(new URL('/auth', req.url));
    }
  } else {
    // If the user IS authenticated and tries to access the /auth page
    if (pathname === '/auth') {
      console.log(`[Middleware] Session found, redirecting from /auth to /`);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res; // Continue to the requested page or API route
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (allow all other API routes for now, can be more specific if needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This broad matcher ensures the middleware runs for most page requests.
     * We then use the `publicPaths` array and specific checks inside the middleware
     * to decide on redirection.
     */
    '/((?!api/auth/callback|_next/static|_next/image|favicon.ico).*)',
    // The /api/auth/callback is crucial for Supabase OAuth to work.
    // Other /api/ routes might need to be public or have their own auth checks.
  ],
};
