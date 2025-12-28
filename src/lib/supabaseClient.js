import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for environment variables
// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available at build time and runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;

// USE SERVICE ROLE KEY TO BYPASS RLS (AS REQUESTED)
// WARNING: This key has full access to your database. Be careful exposing it in production client-side code.
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU";

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Prefer Service Role Key if available (for "no restrictions"), otherwise Anon Key
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

// التحقق من وجود المتغيرات المطلوبة
const validUrl = supabaseUrl?.trim() || '';
const validKey = supabaseKey?.trim() || '';

// Debugging (remove in production if sensitive, but safe to log presence/length)
if (typeof window !== 'undefined') {
  console.log('Supabase Init:', {
    url: validUrl,
    keyLength: validKey ? validKey.length : 0,
    usingServiceRole: !!supabaseServiceRoleKey
  });
}

// التحقق من وجود القيم المطلوبة
if (!validUrl || !validKey) {
  const errorMessage = "Supabase environment variables are missing. Please check .env.local or Netlify settings.";
  console.error(errorMessage);
}

// إنشاء Supabase client مع إعدادات محسّنة
export const supabase = createClient(validUrl || 'https://placeholder.supabase.co', validKey || 'placeholder', {
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
