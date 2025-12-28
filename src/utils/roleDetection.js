import { supabase } from "@/lib/supabaseClient";

/**
 * Normalize role value (Admin, admin, ADMIN -> Admin)
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

/**
 * Get role from user_metadata or JWT token
 */
export const getRoleFromMetadata = (user, session) => {
  let role = user.user_metadata?.role || null;

  // Ignore invalid values
  if (role === "authenticated" || role === "anon") {
    role = null;
  }

  // Try to get role from JWT token
  if (!role && session?.access_token) {
    try {
      const tokenParts = session.access_token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const jwtRole = payload.user_metadata?.role;
        if (
          jwtRole &&
          jwtRole !== "authenticated" &&
          jwtRole !== "anon"
        ) {
          role = jwtRole;
        }
      }
    } catch {
      // Ignore decoding error
    }
  }

  return role ? normalizeRole(role) : null;
};

/**
 * Get role from users table
 */
export const getRoleFromUsersTable = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    if (user?.role) {
      return normalizeRole(user.role);
    }

    return null;
  } catch (err) {
    console.error("Unexpected error in getRoleFromUsersTable:", err);
    return null;
  }
};

/**
 * Detect user role (Main function)
 * Priority 1: 'users' table in Supabase
 * Priority 2: user_metadata or JWT (fallback)
 */
export const detectUserRole = async (user, session) => {
  // Priority 1: Check users table
  let role = await getRoleFromUsersTable(user.id);
  if (role) return role;

  // Priority 2: Check metadata/JWT
  role = getRoleFromMetadata(user, session);
  if (role) return role;

  return null;
};


