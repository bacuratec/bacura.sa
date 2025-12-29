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

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const debug = typeof localStorage !== 'undefined' && localStorage.getItem('SUPABASE_DEBUG') === '1';
  if (debug) {
    console.log('Supabase Init:', {
      url: validUrl,
      keyLength: validAnonKey ? validAnonKey.length : 0,
      envUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      envKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  }
}

// إنشاء Supabase client فقط إذا كانت القيم صحيحة لتفادي أخطاء البناء
export const supabase =
  validUrl && validAnonKey
    ? createClient(validUrl, validAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: { schema: "public" },
        global: { headers: { "x-client-info": "bacura-amal-frontend" } },
      })
    : null;
