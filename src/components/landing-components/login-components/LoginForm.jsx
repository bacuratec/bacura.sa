import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials } from "@/redux/slices/authSlice";
import { detectUserRole } from "@/utils/roleDetection";

const LoginForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const fromParam = searchParams.get("from") || searchParams.get("redirect") || null;
  const from = fromParam ? decodeURIComponent(fromParam) : "/";

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
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.error(t("loginForm.errors.network"));
        setLoading(false);
        return;
      }

      const mapErrorKey = (message) => {
        const msg = (message || "").toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          return "loginForm.errors.invalidCredentials";
        }
        if (msg.includes("network")) {
          return "loginForm.errors.network";
        }
        if (msg.includes("timeout")) {
          return "loginForm.errors.timeout";
        }
        return "loginForm.errors.unknownError";
      };

      const attempt = async () => {
        return await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      };

      let data, error;
      for (let i = 0; i < 3; i++) {
        const res = await attempt();
        data = res.data;
        error = res.error;
        if (!error) break;
        const msg = (error?.message || "").toLowerCase();
        const isTransient =
          msg.includes("failed to fetch") ||
          msg.includes("network") ||
          msg.includes("timeout");
        if (!isTransient) break;
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }

      if (error) {
        const key = mapErrorKey(error.message);
        toast.error(t(key));
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

      // Ensure session is set correctly
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
          toast.error(t("loginForm.errors.sessionError"));
          setLoading(false);
          return;
        }
      }

      // Short delay to ensure session is ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Detect role
      const userRolePromise = detectUserRole(user, session);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000));
      
      const userRole = await Promise.race([userRolePromise, timeoutPromise]);

      if (!userRole) {
        toast.error(t("loginForm.errors.roleNotFound"), { duration: 5000 });
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

      // Short delay for Redux state update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Persist role into auth metadata for server-side checks
      try {
        const { data: updatedUser, error: updateMetaError } = await supabase.auth.updateUser({
          data: { role: userRole },
        });
        if (updateMetaError) {
          console.warn("Failed to update user metadata role:", updateMetaError.message);
        }
      } catch (e) {
        console.warn("Error updating user metadata role:", e?.message || e);
      }

      // Redirect based on role
      const normalizedRole = userRole.toLowerCase();
      
      if (normalizedRole === "admin") {
        router.replace("/admin");
      } else if (normalizedRole === "provider") {
        router.replace("/provider");
      } else if (normalizedRole === "requester") {
        const targetPath = from && from !== "/login" && from !== "/" ? from : "/profile";
        router.replace(targetPath);
      } else {
        toast.warning(t("loginForm.errors.unknownRole"));
        router.replace("/");
      }
    } catch (err) {
      console.error("Login error:", err);
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
          <Link className="text-xs text-primary" href={"/signup"}>
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
