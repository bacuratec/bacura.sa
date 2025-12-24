import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for environment variables
// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available at build time and runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
const validUrl = supabaseUrl?.trim() || '';
const validAnonKey = supabaseAnonKey?.trim() || '';

// التحقق من وجود القيم المطلوبة
// في build time (server-side)، لا نرمي خطأ لتجنب فشل البناء
// في runtime (client-side)، نعرض تحذير فقط ولا نرمي خطأ إلا عند الاستخدام الفعلي
if (!validUrl || !validAnonKey) {
  const errorMessage = 
    "\n" +
    "╔════════════════════════════════════════════════════════════════╗\n" +
    "║  ⚠️  Supabase Configuration Missing                            ║\n" +
    "╚════════════════════════════════════════════════════════════════╝\n\n" +
    "📝 To fix this:\n\n" +
    "1. Set environment variables in Netlify Dashboard:\n" +
    "   - NEXT_PUBLIC_SUPABASE_URL\n" +
    "   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n" +
    "2. Or create '.env.local' file locally:\n\n" +
    "   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n" +
    "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n\n" +
    "3. Get your Supabase credentials from:\n" +
    "   https://app.supabase.com/project/_/settings/api\n\n" +
    "💡 Tip: Environment variables in Netlify are secure and not exposed in git.\n" +
    "═══════════════════════════════════════════════════════════════════\n";
  
  // في build time (server-side)، نعرض تحذير فقط
  if (typeof window === 'undefined') {
    console.warn(errorMessage);
  } else {
    // في runtime (client-side)، نعرض تحذير
    console.warn(errorMessage);
    console.warn("⚠️ Supabase client will be created with empty values. Set environment variables to fix this.");
  }
}

// التحقق من صحة URL (فقط إذا كان موجوداً)
if (validUrl && !validUrl.match(/^https?:\/\//)) {
  const errorMsg = `Invalid Supabase URL format: "${validUrl}". URL must start with http:// or https://`;
  console.error(errorMsg);
  // لا نرمي خطأ في build time
  if (typeof window !== 'undefined') {
    console.error("⚠️ Invalid Supabase URL. Please check your environment variables.");
  }
}

// إنشاء Supabase client مع إعدادات محسّنة
export const supabase = createClient(validUrl || '', validAnonKey || '', {
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

