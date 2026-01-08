import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SERVICE_ROLE_KEY_OVERRIDE || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

console.log("Initializing Supabase Admin Client...");
console.log("URL:", supabaseUrl ? "Present" : "Missing");
console.log("Key:", serviceRoleKey ? "Present" : "Missing");

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "public" },
    })
    : null;

if (!supabaseAdmin) {
  console.error("Supabase Admin Client failed to initialize!");
} else {
  console.log("Supabase Admin Client initialized successfully.");
}

/**
 * Validate that the configured service key can access Supabase (light check).
 * Returns { ok: boolean, message?: string }
 */
export async function validateSupabaseAdminKey() {
  if (!supabaseAdmin) return { ok: false, message: "supabaseAdmin not initialized" };
  try {
    // Lightweight query to verify API key works
    const { error } = await supabaseAdmin.from("attachment_groups").select("id").limit(1);
    if (error) {
      console.error("Supabase key validation error:", error);
      return { ok: false, message: error.message || String(error) };
    }
    return { ok: true };
  } catch (e) {
    console.error("Supabase key validation unexpected error:", e);
    return { ok: false, message: String(e) };
  }
}

