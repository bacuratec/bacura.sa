import { supabase } from "@/lib/supabaseClient";

/**
 * تطبيع قيمة role (Admin, admin, ADMIN -> Admin)
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

/**
 * جلب role من user_metadata أو JWT token
 */
export const getRoleFromMetadata = (user, session) => {
  let role = user.user_metadata?.role || null;

  // تجاهل القيم غير الصالحة
  if (role === "authenticated" || role === "anon") {
    role = null;
  }

  // محاولة جلب role من JWT token
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
      // تجاهل خطأ فك التشفير
    }
  }

  return role ? normalizeRole(role) : null;
};

/**
 * جلب role من جدول users
 */
export const getRoleFromUsersTable = async (userId, email) => {
  try {
    // محاولة استخدام RPC function أولاً
    const { data: rpcRole, error: rpcError } = await supabase.rpc(
      "get_user_role",
      { user_id: userId }
    );

    if (!rpcError && rpcRole) {
      return normalizeRole(rpcRole);
    }

    // البحث في جدول users باستخدام id
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("role, id, email")
      .eq("id", userId)
      .maybeSingle();

    if (dbError) {
      // إذا فشل البحث بـ id، نحاول بـ email
      const { data: emailUser } = await supabase
        .from("users")
        .select("role, id, email")
        .eq("email", email)
        .maybeSingle();

      if (emailUser?.role) {
        return normalizeRole(emailUser.role);
      }
      return null;
    }

    if (dbUser?.role) {
      return normalizeRole(dbUser.role);
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * جلب role من جداول admins, requesters, providers
 */
export const getRoleFromRoleTables = async (userId) => {
  try {
    const [adminResult, requesterResult, providerResult] =
      await Promise.allSettled([
        supabase
          .from("admins")
          .select("id, user_id")
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle(),
        supabase
          .from("requesters")
          .select("id, user_id")
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle(),
        supabase
          .from("providers")
          .select("id, user_id")
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle(),
      ]);

    // أولوية للأدمن
    if (
      adminResult.status === "fulfilled" &&
      adminResult.value.data
    ) {
      return "Admin";
    }

    if (
      requesterResult.status === "fulfilled" &&
      requesterResult.value.data
    ) {
      return "Requester";
    }

    if (
      providerResult.status === "fulfilled" &&
      providerResult.value.data
    ) {
      return "Provider";
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * تحديد role المستخدم (دالة رئيسية)
 * أولوية لجدول users في Supabase للتحقق الداخلي
 */
export const detectUserRole = async (user, session) => {
  // أولوية 1: من جدول users في Supabase (التحقق الداخلي)
  let role = await getRoleFromUsersTable(user.id, user.email);
  if (role) return role;

  // أولوية 2: من جداول admins, requesters, providers
  role = await getRoleFromRoleTables(user.id);
  if (role) return role;

  // أولوية 3: من user_metadata أو JWT (كحل احتياطي فقط)
  role = getRoleFromMetadata(user, session);
  if (role) return role;

  // محاولة أخيرة: البحث في users table بـ email
  try {
    const { data: emailUser } = await supabase
      .from("users")
      .select("role, id, email")
      .eq("email", user.email)
      .maybeSingle();

    if (emailUser?.role) {
      return normalizeRole(emailUser.role);
    }
  } catch {
    // تجاهل الخطأ
  }

  // إذا كان المستخدم مسجلاً للدخول ولكن لم يتم العثور على دور (مثلاً تم إنشاؤه عبر CLI بدون metadata)
  // نفترض أنه "Requester" كدور افتراضي لتمكينه من استخدام المنصة
  if (user && user.aud === "authenticated") {
    return "Requester";
  }

  return null;
};

