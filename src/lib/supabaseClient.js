import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // تحذير في وقت التشغيل ليساعد في ضبط المتغيرات
  console.warn(
    "Supabase URL or anon key is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// التحقق من صحة URL
let validUrl = supabaseUrl;
if (supabaseUrl && typeof supabaseUrl === 'string') {
  try {
    // إزالة أي مسافات أو أحرف غير صحيحة
    validUrl = supabaseUrl.trim();
    // التحقق من أن URL يبدأ بـ http:// أو https://
    if (!validUrl.match(/^https?:\/\//)) {
      console.error("Invalid Supabase URL format. Must start with http:// or https://");
    }
  } catch (error) {
    console.error("Error validating Supabase URL:", error);
  }
}

// إنشاء Supabase client مع إعدادات محسّنة
// لا نضيف headers مخصصة لأن Supabase يتعامل معها تلقائياً
export const supabase = createClient(validUrl || '', supabaseAnonKey || '', {
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


