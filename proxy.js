import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(request) {
  // 1. Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If config is missing, we can't do auth checks. 
    // Just return the response (or you could redirect to an error page)
    console.error('Supabase env vars missing in proxy')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          
          // Re-create the response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Set the cookies on the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Helper to get role safely
  const getUserRole = (user) => {
    return user?.user_metadata?.role || null
  }

  // 1. Admin Protection
  if (url.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    const role = getUserRole(user)
    if (role !== 'Admin') {
       if (role === 'Provider') {
         url.pathname = '/provider'
       } else {
         url.pathname = '/profile' // Default for Requester
       }
       return NextResponse.redirect(url)
    }
  }

  // 2. Provider Protection
  if (url.pathname.startsWith('/provider')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = getUserRole(user)
    if (role !== 'Provider') {
       if (role === 'Admin') {
         url.pathname = '/admin'
       } else {
         url.pathname = '/profile'
       }
       return NextResponse.redirect(url)
    }
  }

  // 3. Profile/Requester Protection
  // Exclude /profile-info because it might be used differently, 
  // but if it's under /admin or /provider it's already caught.
  // This block catches /profile which is the Requester dashboard.
  if (url.pathname.startsWith('/profile')) {
     if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    const role = getUserRole(user)
    if (role === 'Admin') {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }
    if (role === 'Provider') {
        url.pathname = '/provider'
        return NextResponse.redirect(url)
    }
    // Requester allowed
  }

  // 4. Request Service Protection (Requester only)
  if (url.pathname.startsWith('/request-service')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = getUserRole(user)
    if (role === 'Admin') {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }
    if (role === 'Provider') {
        url.pathname = '/provider'
        return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
