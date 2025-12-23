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
      let userRole = user.user_metadata?.role || null;

      // أولوية 2: التحقق من جدول users أولاً (لأن الأدمن موجود في users table)
      if (!userRole) {
        try {
          // أولاً: نحاول جلب role من جدول users مباشرة
          const { data: dbUser, error: dbError } = await supabase
            .from("users")
            .select("role, id")
            .eq("id", user.id)
            .maybeSingle();

          if (!dbError && dbUser) {
            // إذا كان role موجود في users، نستخدمه مباشرة
            if (dbUser.role) {
              userRole = dbUser.role;
              // eslint-disable-next-line no-console
              console.log("Role detected from users table:", userRole);
            }
          } else if (dbError) {
            // eslint-disable-next-line no-console
            console.warn("Error fetching from users table:", dbError.message);
          }

          // إذا لم نجد role من users table، نحاول من الجداول الأخرى
          if (!userRole) {
            // نحاول التحقق من وجود المستخدم في جداول admins, requesters, providers
            const [adminResult, requesterResult, providerResult] = await Promise.allSettled([
              // التحقق من admins table
              supabase
                .from("admins")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
              // التحقق من requesters table
              supabase
                .from("requesters")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
              // التحقق من providers table
              supabase
                .from("providers")
                .select("id, user_id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle(),
            ]);

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
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Error fetching role:", e);
          // محاولة أخيرة: التحقق من role في users table مباشرة
          try {
            // محاولة 1: البحث في users table للتحقق من role = 'Admin'
            const userRoleCheck = await supabase
              .from("users")
              .select("role")
              .eq("id", user.id)
              .maybeSingle();
            
            if (userRoleCheck.data && userRoleCheck.data.role) {
              userRole = userRoleCheck.data.role;
              // eslint-disable-next-line no-console
              console.log("Role detected in final check from users table:", userRole);
            } else {
              // محاولة 2: البحث في admins table
              const finalAdminCheck = await supabase
                .from("admins")
                .select("id")
                .or(`id.eq.${user.id},user_id.eq.${user.id}`)
                .maybeSingle();
              
              if (finalAdminCheck.data) {
                userRole = "Admin";
                // eslint-disable-next-line no-console
                console.log("Admin role detected in final check from admins table");
              }
            }
          } catch (finalError) {
            // eslint-disable-next-line no-console
            console.error("Final role check failed:", finalError);
          }
        }
      } else {
        // إذا كان الـ role موجود في user_metadata، نتأكد من صحته
        // eslint-disable-next-line no-console
        console.log("Role from user_metadata:", userRole);
      }

      // إذا لم نتمكن من تحديد role، نعرض رسالة تحذير
      if (!userRole) {
        toast.error(
          "لم يتم العثور على صلاحيات المستخدم. يرجى التواصل مع الدعم الفني.",
          { duration: 5000 }
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
