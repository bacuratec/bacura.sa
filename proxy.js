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

  const normalizeRole = (role) => {
    if (!role || typeof role !== 'string') return null
    const r = role.toLowerCase()
    if (r === 'admin') return 'Admin'
    if (r === 'provider') return 'Provider'
    if (r === 'requester') return 'Requester'
    return null
  }

  const getEffectiveUserRole = async (user) => {
    if (!user) return null
    const metaRole = normalizeRole(user.user_metadata?.role || null)
    if (metaRole) return metaRole
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (error) return null
    return normalizeRole(data?.role || null)
  }

  if (url.pathname.startsWith('/login')) {
    if (user) {
      const role = await getEffectiveUserRole(user)
      if (role === 'Admin') {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      if (role === 'Provider') {
        url.pathname = '/provider'
        return NextResponse.redirect(url)
      }
      if (role === 'Requester') {
        url.pathname = '/profile'
        return NextResponse.redirect(url)
      }
      // Unknown role: default to requester dashboard
      url.pathname = '/profile'
      return NextResponse.redirect(url)
    }
  }

  // 1. Admin Protection
  if (url.pathname.startsWith('/admin')) {
    if (user) {
      const role = await getEffectiveUserRole(user)
      if (role !== 'Admin') {
         if (role === 'Provider') {
           url.pathname = '/provider'
         } else {
           url.pathname = '/profile' // Default for Requester
         }
         return NextResponse.redirect(url)
      }
    }
  }

  // 2. Provider Protection
  if (url.pathname.startsWith('/provider')) {
    if (user) {
      const role = await getEffectiveUserRole(user)
      if (role !== 'Provider') {
         if (role === 'Admin') {
           url.pathname = '/admin'
         } else {
           url.pathname = '/profile'
         }
         return NextResponse.redirect(url)
      }
    }
  }

  // 3. Profile/Requester Protection
  // Exclude /profile-info because it might be used differently, 
  // but if it's under /admin or /provider it's already caught.
  // This block catches /profile which is the Requester dashboard.
  if (url.pathname.startsWith('/profile')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', '/profile')
      return NextResponse.redirect(loginUrl)
    }
    if (user) {
      const role = await getEffectiveUserRole(user)
      if (role === 'Admin') {
          url.pathname = '/admin'
          return NextResponse.redirect(url)
      }
      if (role === 'Provider') {
          url.pathname = '/provider'
          return NextResponse.redirect(url)
      }
    }
    // Requester allowed
  }

  // 4. Request Service Protection (Requester only)
  if (url.pathname.startsWith('/request-service')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', '/request-service')
      return NextResponse.redirect(loginUrl)
    }
    if (user) {
      const role = await getEffectiveUserRole(user)
      if (role === 'Admin') {
          url.pathname = '/admin'
          return NextResponse.redirect(url)
      }
      if (role === 'Provider') {
          url.pathname = '/provider'
          return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
