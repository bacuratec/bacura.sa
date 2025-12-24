import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials } from "@/redux/slices/authSlice";

const LoginForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("loginForm.validation.invalidEmail"))
      .required(t("loginForm.validation.required")),
    password: Yup.string()
      .min(6, t("loginForm.validation.passwordMin"))
      .required(t("loginForm.validation.required")),
  });

  /**
   * تطبيع قيمة role (Admin, admin, ADMIN -> Admin)
   */
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  /**
   * جلب role من user_metadata أو JWT token
   */
  const getRoleFromMetadata = (user, session) => {
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
  const getRoleFromUsersTable = async (userId, email) => {
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
  const getRoleFromRoleTables = async (userId) => {
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
   * تحديد role المستخدم
   */
  const detectUserRole = async (user, session) => {
    // أولوية 1: من user_metadata أو JWT
    let role = getRoleFromMetadata(user, session);
    if (role) return role;

    // أولوية 2: من جدول users
    role = await getRoleFromUsersTable(user.id, user.email);
    if (role) return role;

    // أولوية 3: من جداول admins, requesters, providers
    role = await getRoleFromRoleTables(user.id);
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

    return null;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(
          error.message || t("loginForm.errors.invalidCredentials")
        );
        setLoading(false);
        return;
      }

      const session = data?.session;
      const user = data?.user;

      if (!session || !user) {
        toast.error(t("loginForm.errors.unknownError"));
        setLoading(false);
        return;
      }

      // التأكد من أن الجلسة معينة بشكل صحيح
      const {
        data: { session: verifiedSession },
      } = await supabase.auth.getSession();

      if (
        !verifiedSession ||
        verifiedSession.access_token !== session.access_token
      ) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (setSessionError) {
          toast.error(
            t("loginForm.errors.sessionError") ||
              "فشل في تعيين جلسة المستخدم. يرجى المحاولة مرة أخرى."
          );
          setLoading(false);
          return;
        }
      }

      // انتظار قصير للتأكد من أن الجلسة جاهزة
      await new Promise((resolve) => setTimeout(resolve, 50));

      // تحديد role المستخدم
      const userRole = await detectUserRole(user, session);

      if (!userRole) {
        toast.error(
          t("loginForm.errors.roleNotFound") ||
            `لم يتم العثور على صلاحيات المستخدم.\nالمشكلة: RLS (Row Level Security) policies تمنع قراءة البيانات.\nالحل: يجب تعديل RLS policies في Supabase للسماح للمستخدم بقراءة صفه من جدول users.\nUser ID: ${user.id}\nEmail: ${user.email}`,
          { duration: 10000 }
        );
        setLoading(false);
        return;
      }

      dispatch(
        setCredentials({
          token: session.access_token,
          refreshToken: session.refresh_token || null,
          role: userRole,
          userId: user.id,
        })
      );

      // انتظار قصير لضمان تحديث Redux state
      await new Promise((resolve) => setTimeout(resolve, 100));

      // توجيه حسب الدور
      if (userRole === "Admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "Provider") {
        navigate("/provider", { replace: true });
      } else if (userRole === "Requester") {
        navigate(from || "/", { replace: true });
      } else {
        toast.warning(
          t("loginForm.errors.unknownRole") ||
            "دور المستخدم غير معروف. سيتم توجيهك للصفحة الرئيسية."
        );
        navigate("/", { replace: true });
      }
    } catch {
      toast.error(t("loginForm.errors.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-[40px] bg-white text-black pt-5 pb-10 px-4 sm:px-6 md:px-8"
      style={{ boxShadow: "0px 4px 35px 0px rgba(0, 0, 0, 0.08)" }}
    >
      <div className="headForm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-normal text-black text-center sm:text-start">
          {t("loginForm.welcome")}{" "}
          <span className="text-primary font-medium">
            {t("loginForm.brand")}
          </span>
        </h2>
        <div className="create text-center sm:text-end">
          <h3 className="text-[#8D8D8D] text-xs">
            {t("loginForm.noAccount")}
          </h3>
          <Link className="text-xs text-primary" to={"/signup"}>
            {t("loginForm.createAccount")}
          </Link>
        </div>
      </div>

      <h4 className="text-3xl sm:text-4xl md:text-5xl font-medium mt-6 text-center sm:text-start">
        {t("loginForm.loginTitle")}
      </h4>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors }) => (
          <Form className="mt-9 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label htmlFor="email">
                {t("loginForm.email")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                placeholder={t("loginForm.email")}
                className={`w-full rounded-lg border py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-light outline-none ${
                  touched.email && errors.email
                    ? "border-red-500"
                    : "border-[#ADADAD] focus:border-[#4285F4]"
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label htmlFor="password">
                {t("loginForm.password")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("loginForm.password")}
                  className={`w-full rounded-lg border py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-light outline-none pr-12 ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-[#ADADAD] focus:border-[#4285F4]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary h-14 sm:h-16 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t("loginForm.loggingIn")}</span>
                </>
              ) : (
                t("loginForm.loginButton")
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
