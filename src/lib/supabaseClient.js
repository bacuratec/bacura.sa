import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for environment variables
// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available at build time and runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
const validUrl = supabaseUrl?.trim() || '';
const validAnonKey = supabaseAnonKey?.trim() || '';

// التحقق من وجود القيم المطلوبة
if (!validUrl || !validAnonKey) {
  const errorMessage = 
    "\n" +
    "╔════════════════════════════════════════════════════════════════╗\n" +
    "║  ❌ Supabase Configuration Missing                            ║\n" +
    "╚════════════════════════════════════════════════════════════════╝\n\n" +
    "📝 To fix this error:\n\n" +
    "1. Create a file named '.env.local' in the project root directory\n" +
    "2. Add the following lines to .env.local:\n\n" +
    "   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n" +
    "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n\n" +
    "3. Get your Supabase credentials from:\n" +
    "   https://app.supabase.com/project/_/settings/api\n\n" +
    "4. Restart your Next.js dev server after creating the file\n\n" +
    "💡 Tip: The .env.local file is gitignored, so your credentials stay secure.\n" +
    "═══════════════════════════════════════════════════════════════════\n";
  
  console.error(errorMessage);
  
  // في وضع التطوير، نعرض رسالة أكثر تفصيلاً
  if (typeof window !== 'undefined') {
    // في المتصفح: نعرض رسالة في console فقط
    console.error("\n🔧 Quick Fix: Create .env.local file in project root with your Supabase credentials\n");
  }
  
  throw new Error(
    "Supabase environment variables are missing. " +
    "Please create a .env.local file in the project root with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "See console for detailed instructions."
  );
}

// التحقق من صحة URL
if (!validUrl.match(/^https?:\/\//)) {
  const errorMsg = `Invalid Supabase URL format: "${validUrl}". URL must start with http:// or https://`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// إنشاء Supabase client مع إعدادات محسّنة
export const supabase = createClient(validUrl, validAnonKey, {
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


