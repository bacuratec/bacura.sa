import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
const validUrl = supabaseUrl?.trim() || '';
const validAnonKey = supabaseAnonKey?.trim() || '';

if (!validUrl || !validAnonKey) {
  console.error(
    "❌ Supabase configuration is missing in middleware!\n" +
    "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

// Routes that require authentication
const protectedRoutes = [
  "/request-service",
  "/requests",
  "/projects",
  "/profile",
  "/tickets",
  "/provider",
  "/admin",
];

// Routes that should redirect if authenticated
const guestRoutes = ["/login", "/signup", "/signup-provider"];

// Admin routes
const adminRoutes = ["/admin"];

// Provider routes
const providerRoutes = ["/provider"];

// Requester routes
const requesterRoutes = [
  "/request-service",
  "/requests",
  "/projects",
  "/profile",
  "/tickets",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // التحقق من وجود القيم قبل إنشاء العميل
  if (!validUrl || !validAnonKey) {
    // إذا لم تكن المتغيرات موجودة، نسمح بالمرور بدون مصادقة
    // لكن هذا يجب إصلاحه قبل النشر
    console.warn("Supabase not configured - middleware will allow all requests");
    return NextResponse.next();
  }
  
  // التحقق من صحة URL
  if (!validUrl.match(/^https?:\/\//)) {
    console.error(`Invalid Supabase URL format in middleware: "${validUrl}"`);
    return NextResponse.next();
  }
  
  const supabase = createClient(validUrl, validAnonKey);

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isGuestRoute = guestRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProviderRoute = providerRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isRequesterRoute = requesterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect guest routes if authenticated
  if (isGuestRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (session) {
    // Get user role from session metadata or database
    // This is a simplified version - you may need to fetch from database
    const userRole = session.user?.user_metadata?.role;

    if (isAdminRoute && userRole !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isProviderRoute && userRole !== "Provider") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isRequesterRoute && userRole !== "Requester") {
      return NextResponse.redirect(new URL("/", request.url));
    }
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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

