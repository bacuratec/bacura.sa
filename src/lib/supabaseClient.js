import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for environment variables
// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available at build time and runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;

// CRITICAL: For security, the client-side MUST use the ANON key.
// The Service Role Key bypasses all RLS and should NEVER be exposed to the browser.
// It is only safe for server-side operations.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
const validUrl = supabaseUrl?.trim() || '';
const validAnonKey = supabaseAnonKey?.trim() || '';

// Debugging (remove in production if sensitive, but safe to log presence/length)
if (typeof window !== 'undefined') {
  console.log('Supabase Init:', {
    url: validUrl,
    keyLength: validAnonKey ? validAnonKey.length : 0,
    envUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    envKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}

// التحقق من وجود القيم المطلوبة
if (!validUrl || !validAnonKey) {
  const errorMessage = "Supabase environment variables are missing. Please check .env.local or Netlify settings.";
  console.error(errorMessage);
}

// إنشاء Supabase client مع إعدادات محسّنة
export const supabase = createClient(validUrl || 'https://placeholder.supabase.co', validAnonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'bacura-amal-frontend',
    },
  },
});
