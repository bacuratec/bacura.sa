import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/signup-provider', '/our-services', '/about-us', '/how-it-work', '/faqs', '/partners'];

// Routes that require specific roles
const roleBasedRoutes = {
  '/admin': ['Admin'],
  '/provider': ['Provider'],
  '/': ['Requester'], // Landing pages for requesters
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For protected routes, we'll handle authentication in the component level
  // since we need Redux state which is only available client-side
  // The actual auth check will be done in AuthGuard component
  
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

