import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    // Update the session and get the user
    const { response, user } = await updateSession(request)

    const { pathname } = request.nextUrl

    // Define public routes that don't need authentication
    // These are paths that should be accessible without a login
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/about-us') ||
        pathname.startsWith('/faqs') ||
        pathname.startsWith('/how-it-work') ||
        pathname.startsWith('/our-services') ||
        pathname.startsWith('/partners') ||
        pathname.startsWith('/projects') ||
        pathname.startsWith('/callback') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // for static files like favicon.ico, images, etc.

    // 1. If it's a protected route and no user is found, redirect to login
    if (!isPublicRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Preserve the current path to redirect back after login
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 2. Role-based protection (requires role in user metadata)
    if (user) {
        const rawRole = user.user_metadata?.role
        const role = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : null

        // Admin only pages
        if (pathname.startsWith('/admin') && role !== 'Admin') {
            // If we are sure they are NOT an admin, redirect them
            // Note: Some legacy users might not have 'role' in metadata yet
            // so we might want to be careful here if role is undefined
            if (role) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // Provider only pages
        if (pathname.startsWith('/provider') && role && role !== 'Provider' && role !== 'Admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // 3. Redirect logged-in users away from login/signup pages
        if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && user) {
            const url = request.nextUrl.clone()
            // Determine dashboard based on role
            if (role === 'Admin') url.pathname = '/admin'
            else if (role === 'Provider') url.pathname = '/provider'
            else url.pathname = '/profile'

            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
