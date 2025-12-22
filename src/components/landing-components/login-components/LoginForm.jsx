import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useLoginMutation } from "../../../redux/api/authApi";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const LoginForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);

  const from = location.state?.from?.pathname || "/";

  const [login, { isLoading: loading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

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
    try {
      await login({ Email: values.email, Password: values.password }).unwrap();
      if (from && role === "Requester") {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.error.data.Message);
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
