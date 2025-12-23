import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials } from "@/redux/slices/authSlice";

const LoginForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);

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

      // التأكد من أن الجلسة معينة في Supabase client
      // Supabase يقوم بذلك تلقائياً بعد signInWithPassword
      // لكن نتأكد من أن الجلسة جاهزة قبل تنفيذ أي استعلامات
      // نتحقق من الجلسة بشكل صريح
      const {
        data: { session: verifiedSession },
      } = await supabase.auth.getSession();

      if (!verifiedSession || verifiedSession.access_token !== session.access_token) {
        // إذا لم تكن الجلسة معينة بشكل صحيح، نعيد تعيينها
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (setSessionError) {
          // eslint-disable-next-line no-console
          console.error("Error setting session:", setSessionError);
          toast.error("فشل في تعيين جلسة المستخدم. يرجى المحاولة مرة أخرى.");
          setLoading(false);
          return;
        }
      }

      // انتظار قصير للتأكد من أن الجلسة جاهزة
      await new Promise((resolve) => setTimeout(resolve, 50));

      // أولوية 1: الدور من user_metadata (Supabase Auth)
      // نتجاهل role: 'authenticated' لأنه ليس الـ role الفعلي
      let userRole = user.user_metadata?.role || null;
      
      // نتأكد من أن role ليس 'authenticated' (هذا ليس role فعلي)
      if (userRole === 'authenticated' || userRole === 'anon') {
        userRole = null;
      }
      
      // محاولة جلب role من JWT token مباشرة (لكن نتجاهل 'authenticated')
      if (!userRole && session?.access_token) {
        try {
          // فك تشفير JWT token للحصول على role
          const tokenParts = session.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            // eslint-disable-next-line no-console
            console.log("JWT payload:", payload);
            
            // نبحث عن role في user_metadata فقط، نتجاهل role الأساسي لأنه 'authenticated'
            if (payload.user_metadata?.role && 
                payload.user_metadata.role !== 'authenticated' && 
                payload.user_metadata.role !== 'anon') {
              userRole = payload.user_metadata.role;
              // eslint-disable-next-line no-console
              console.log("Role found in JWT user_metadata:", userRole);
            }
          }
        } catch (jwtError) {
          // eslint-disable-next-line no-console
          console.error("Error decoding JWT:", jwtError);
        }
      }
      
      // eslint-disable-next-line no-console
      console.log("Initial role from user_metadata/JWT (after filtering 'authenticated'):", userRole);
      // eslint-disable-next-line no-console
      console.log("User ID:", user.id);
      // eslint-disable-next-line no-console
      console.log("User email:", user.email);

      // أولوية 2: التحقق من جدول users أولاً (لأن الأدمن موجود في users table)
      if (!userRole) {
        try {
          // محاولة استخدام RPC function أولاً (إذا كانت موجودة) لتجاوز RLS
          // eslint-disable-next-line no-console
          console.log("Attempting to fetch role using RPC function...");
          const { data: rpcRole, error: rpcError } = await supabase.rpc('get_user_role', {
            user_id: user.id
          });
          
          if (!rpcError && rpcRole) {
            userRole = rpcRole;
            // eslint-disable-next-line no-console
            console.log("Role found via RPC function:", userRole);
          } else if (rpcError) {
            // eslint-disable-next-line no-console
            console.log("RPC function not available or failed:", rpcError.message);
          }
          
          // إذا لم نجد من RPC، نحاول من جدول users مباشرة
          if (!userRole) {
            // eslint-disable-next-line no-console
            console.log("Attempting to fetch role from users table...");
            const { data: dbUser, error: dbError } = await supabase
              .from("users")
              .select("role, id, email")
              .eq("id", user.id)
              .maybeSingle();

            // eslint-disable-next-line no-console
            console.log("Users table query result:", { dbUser, dbError });

            if (dbError) {
              // eslint-disable-next-line no-console
              console.error("Error fetching from users table:", dbError);
              // eslint-disable-next-line no-console
              console.error("Error details:", JSON.stringify(dbError, null, 2));
              
              // إذا كان الخطأ متعلق بـ RLS أو permissions
              if (dbError.code === 'PGRST116' || dbError.message?.includes('permission') || dbError.message?.includes('policy')) {
                // eslint-disable-next-line no-console
                console.warn("RLS policy may be blocking access. User might exist but cannot be read.");
              }
            } else if (dbUser) {
            // إذا كان role موجود في users، نستخدمه مباشرة
            // نتعامل مع حالات مختلفة (Admin, admin, ADMIN)
            if (dbUser.role) {
              // تطبيع قيمة role (Admin, admin, ADMIN -> Admin)
              const normalizedRole = dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1).toLowerCase();
              userRole = normalizedRole;
              // eslint-disable-next-line no-console
              console.log("Role detected from users table:", dbUser.role, "-> normalized to:", userRole);
            } else {
              // eslint-disable-next-line no-console
              console.warn("User found in users table but role is null or empty");
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn("No user found in users table with id:", user.id);
            // eslint-disable-next-line no-console
            console.warn("This might be due to RLS policies blocking access. User may exist but cannot be read.");
          }

          // إذا لم نجد role من users table، نحاول من الجداول الأخرى
          if (!userRole) {
            // eslint-disable-next-line no-console
            console.log("Role not found in users table, checking other tables...");
            // نحاول التحقق من وجود المستخدم في جداول admins, requesters, providers
            // نبحث باستخدام id و user_id و email
            const [adminResult, requesterResult, providerResult] = await Promise.allSettled([
              // التحقق من admins table - نبحث بـ id و user_id
              supabase
                .from("admins")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
              // التحقق من requesters table - نبحث بـ id و user_id
              supabase
                .from("requesters")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
              // التحقق من providers table - نبحث بـ id و user_id
              supabase
                .from("providers")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
            ]);

            // eslint-disable-next-line no-console
            console.log("Other tables check results:", {
              admin: {
                status: adminResult.status,
                data: adminResult.status === "fulfilled" ? adminResult.value.data : null,
                error: adminResult.status === "fulfilled" ? adminResult.value.error : adminResult.reason,
              },
              requester: {
                status: requesterResult.status,
                data: requesterResult.status === "fulfilled" ? requesterResult.value.data : null,
                error: requesterResult.status === "fulfilled" ? requesterResult.value.error : requesterResult.reason,
              },
              provider: {
                status: providerResult.status,
                data: providerResult.status === "fulfilled" ? providerResult.value.data : null,
                error: providerResult.status === "fulfilled" ? providerResult.value.error : providerResult.reason,
              },
            });

            // أولوية للأدمن
            if (adminResult.status === "fulfilled" && adminResult.value.data) {
              userRole = "Admin";
              // eslint-disable-next-line no-console
              console.log("Admin role detected from admins table");
            } else if (requesterResult.status === "fulfilled" && requesterResult.value.data) {
              userRole = "Requester";
              // eslint-disable-next-line no-console
              console.log("Requester role detected");
            } else if (providerResult.status === "fulfilled" && providerResult.value.data) {
              userRole = "Provider";
              // eslint-disable-next-line no-console
              console.log("Provider role detected");
            } else {
              // إذا لم نجد في أي جدول، نحاول البحث في users table باستخدام email
              // eslint-disable-next-line no-console
              console.log("User not found in any table, trying to search by email in users table...");
              try {
              const emailSearch = await supabase
                .from("users")
                .select("role, id, email")
                .eq("email", user.email)
                .maybeSingle();
              
              // eslint-disable-next-line no-console
              console.log("Email search result:", emailSearch);
              
              if (emailSearch.data && emailSearch.data.role) {
                const normalizedRole = emailSearch.data.role.charAt(0).toUpperCase() + emailSearch.data.role.slice(1).toLowerCase();
                userRole = normalizedRole;
                // eslint-disable-next-line no-console
                console.log("Role detected from users table using email:", emailSearch.data.role, "-> normalized to:", userRole);
              } else if (!emailSearch.data) {
                // إذا لم نجد المستخدم في users table أيضاً، قد يكون المستخدم موجود في جدول admins مباشرة
                // نحاول البحث في admins table مرة أخرى بشكل مختلف
                // eslint-disable-next-line no-console
                console.log("User not found in users table by email either. Trying alternative admin search...");
                
                // محاولة البحث في admins table بدون user_id (ربما id هو نفسه user_id)
                const adminAlternativeSearch = await supabase
                  .from("admins")
                  .select("id")
                  .eq("id", user.id)
                  .maybeSingle();
                
                // eslint-disable-next-line no-console
                console.log("Alternative admin search result:", adminAlternativeSearch);
                
                if (adminAlternativeSearch.data) {
                  userRole = "Admin";
                  // eslint-disable-next-line no-console
                  console.log("Admin role detected from alternative admin search");
                }
              }
              } catch (emailError) {
                // eslint-disable-next-line no-console
                console.error("Error searching by email:", emailError);
              }
            }
          }
        }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Error fetching role:", e);
          // eslint-disable-next-line no-console
          console.error("Error stack:", e.stack);
          // محاولة أخيرة: التحقق من role في users table مباشرة
          try {
            // eslint-disable-next-line no-console
            console.log("Attempting final role check...");
            // محاولة 1: البحث في users table للتحقق من role
            const userRoleCheck = await supabase
              .from("users")
              .select("role, id, email")
              .eq("id", user.id)
              .maybeSingle();
            
            // eslint-disable-next-line no-console
            console.log("Final users table check:", userRoleCheck);
            
            if (userRoleCheck.data && userRoleCheck.data.role) {
              // تطبيع قيمة role
              const normalizedRole = userRoleCheck.data.role.charAt(0).toUpperCase() + userRoleCheck.data.role.slice(1).toLowerCase();
              userRole = normalizedRole;
              // eslint-disable-next-line no-console
              console.log("Role detected in final check from users table:", userRoleCheck.data.role, "-> normalized to:", userRole);
            } else {
              // محاولة 2: البحث في admins table
              const finalAdminCheck = await supabase
                .from("admins")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle();
              
              // eslint-disable-next-line no-console
              console.log("Final admins table check:", finalAdminCheck);
              
              if (finalAdminCheck.data) {
                userRole = "Admin";
                // eslint-disable-next-line no-console
                console.log("Admin role detected in final check from admins table");
              }
            }
          } catch (finalError) {
            // eslint-disable-next-line no-console
            console.error("Final role check failed:", finalError);
            // eslint-disable-next-line no-console
            console.error("Final error details:", JSON.stringify(finalError, null, 2));
          }
        }
      } else {
        // إذا كان الـ role موجود في user_metadata، نتأكد من صحته
        // eslint-disable-next-line no-console
        console.log("Role from user_metadata:", userRole);
      }

      // إذا لم نتمكن من تحديد role، نحاول طريقة أخيرة: البحث في جميع الجداول بشكل شامل
      if (!userRole) {
        // eslint-disable-next-line no-console
        console.log("Role not found, attempting comprehensive search...");
        try {
          // محاولة شاملة: البحث في users table باستخدام email
          const comprehensiveUsersSearch = await supabase
            .from("users")
            .select("role, id, email")
            .eq("email", user.email)
            .maybeSingle();
          
          // eslint-disable-next-line no-console
          console.log("Comprehensive users search by email:", comprehensiveUsersSearch);
          
          if (comprehensiveUsersSearch.data?.role) {
            const normalizedRole = comprehensiveUsersSearch.data.role.charAt(0).toUpperCase() + comprehensiveUsersSearch.data.role.slice(1).toLowerCase();
            userRole = normalizedRole;
            // eslint-disable-next-line no-console
            console.log("Role found in comprehensive search:", userRole);
          } else {
            // إذا لم نجد في users، نحاول البحث في admins مباشرة
            const comprehensiveAdminSearch = await supabase
              .from("admins")
              .select("id, user_id")
              .eq("id", user.id)
              .maybeSingle();
            
            // eslint-disable-next-line no-console
            console.log("Comprehensive admin search:", comprehensiveAdminSearch);
            
            if (comprehensiveAdminSearch.data) {
              userRole = "Admin";
              // eslint-disable-next-line no-console
              console.log("Admin role found in comprehensive search");
            }
          }
        } catch (comprehensiveError) {
          // eslint-disable-next-line no-console
          console.error("Comprehensive search failed:", comprehensiveError);
        }
      }
      
      // إذا لم نتمكن من تحديد role بعد كل المحاولات، نعرض رسالة تحذير
      if (!userRole) {
        // eslint-disable-next-line no-console
        console.error("Failed to detect user role after all attempts. User info:", {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        });
        toast.error(
          `لم يتم العثور على صلاحيات المستخدم.\nالمشكلة: RLS (Row Level Security) policies تمنع قراءة البيانات.\nالحل: يجب تعديل RLS policies في Supabase للسماح للمستخدم بقراءة صفه من جدول users.\nUser ID: ${user.id}\nEmail: ${user.email}`,
          { duration: 10000 }
        );
        setLoading(false);
        return;
      }
      
      // eslint-disable-next-line no-console
      console.log("Final detected role:", userRole);

      dispatch(
        setCredentials({
          token: session.access_token,
          refreshToken: session.refresh_token || null,
          role: userRole,
          userId: user.id,
        })
      );

      // توجيه حسب الدور
      if (userRole === "Admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "Provider") {
        navigate("/provider", { replace: true });
      } else if (userRole === "Requester") {
        navigate(from || "/", { replace: true });
      } else {
        // في حال لم يوجد role واضح، نرجع للصفحة الرئيسية
        toast.warning("دور المستخدم غير معروف. سيتم توجيهك للصفحة الرئيسية.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
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
          <h3 className="text-[#8D8D8D] text-xs">{t("loginForm.noAccount")}</h3>
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
                {t("loginForm.email")} <span className="text-red-500">*</span>
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
