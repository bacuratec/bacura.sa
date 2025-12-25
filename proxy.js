import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const validUrl = supabaseUrl?.trim() || "";
const validAnonKey = supabaseAnonKey?.trim() || "";

const protectedRoutes = [
  "/request-service",
  "/requests",
  "/projects",
  "/profile",
  "/tickets",
  "/provider",
  "/admin",
];

const guestRoutes = ["/login", "/signup", "/signup-provider"];
const adminRoutes = ["/admin"];
const providerRoutes = ["/provider"];
const requesterRoutes = ["/request-service", "/requests", "/projects", "/profile", "/tickets"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (!validUrl || !validAnonKey) {
    return NextResponse.next();
  }

  if (!validUrl.match(/^https?:\/\//)) {
    return NextResponse.next();
  }

  const supabase = createClient(validUrl, validAnonKey);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isGuestRoute = guestRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProviderRoute = providerRoutes.some((route) => pathname.startsWith(route));
  const isRequesterRoute = requesterRoutes.some((route) => pathname.startsWith(route));

  if (isGuestRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
