import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import fileUpload from "../../../assets/icons/fileUpload.svg";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

const SignupForm = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  // const [show, setShow] = useState(false);
  const [apiErrors] = useState({});
  const [role, setRole] = useState("");
  const location = useLocation();
  const [types, setTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isProvider = location.pathname === "/signup-provider";

  const navigate = useNavigate();

  const buttonText = isProvider
    ? t("signupForm.submitProvider")
    : t("signupForm.submitRequester");
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        // جلب المدن من جدول cities
        const { data: citiesData, error: citiesError } = await supabase
          .from("cities")
          .select("id, name_ar, name_en")
          .order("id", { ascending: true });

        if (citiesError) throw citiesError;
        setAddresses(
          (citiesData || []).map((c) => ({
            id: c.id,
            nameAr: c.name_ar,
            nameEn: c.name_en,
          }))
        );

        // جلب أنواع الكيان من lookup_values حسب نوع المستخدم
        const lookupCode = isProvider
          ? "provider-entity-types"
          : "requester-entity-types";

        const { data: typesData, error: typesError } = await supabase
          .from("lookup_values")
          .select(
            "id, name_ar, name_en, lookup_types!inner(code)"
          )
          .eq("lookup_types.code", lookupCode);

        if (typesError) throw typesError;

        setTypes(
          (typesData || []).map((item) => ({
            id: item.id,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }))
        );

        setRole(isProvider ? "Provider" : "Requester");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Lookup fetch error:", error);
        toast.error(t("signupForm.lookupError"));
      }
    };

    fetchLookups();
  }, [isProvider, t]);

  const initialValues = {
    fullName: "",
    entityType: "",
    email: "",
    phone: "",
    region: "",
    commercialRecord: "",
    commercialRegistrationDate: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false, // ✅ جديد
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required(
      t("signupForm.validation.fullNameRequired")
    ),
    entityType: Yup.string().required(
      t("signupForm.validation.entityTypeRequired")
    ),
    email: Yup.string()
      .email(t("signupForm.validation.emailInvalid"))
      .required(t("signupForm.validation.emailRequired")),
    phone: Yup.string()
      .required(t("signupForm.validation.phoneRequired"))
      .matches(
        /^(?:\+?966\s?5\d{2}\s?\d{3}\s?\d{3}|05\d{8})$/,
        t("signupForm.validation.phoneInvalid")
      ),
    region: Yup.string().required(t("signupForm.validation.regionRequired")),
    commercialRecord: Yup.string().required(
      t("signupForm.validation.commercialRecordRequired")
    ),
    commercialRegistrationDate: Yup.string().required(
      t("signupForm.validation.commercialDateRequired")
    ),
    password: Yup.string()
      .min(6, t("signupForm.validation.passwordShort"))
      .required(t("signupForm.validation.passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        t("signupForm.validation.confirmPasswordMismatch")
      )
      .required(t("signupForm.validation.confirmPasswordRequired")),
    agreeToTerms: Yup.bool().oneOf(
      [true],
      t("signupForm.validation.agreeRequired")
    ),
  });

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };
  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      // رفع صورة الملف الشخصي (اختياري) إلى Supabase Storage
      let profilePicturePath = null;
      if (profilePicture) {
        const uploadPath = `profile-pictures/${Date.now()}-${
          profilePicture.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(uploadPath, profilePicture);

        if (uploadError) {
          toast.error(t("signupForm.registerError"));
          // eslint-disable-next-line no-console
          console.error("Supabase profile picture upload error:", uploadError);
          return;
        }
        profilePicturePath = uploadPath;
      }

      // رفع المرفقات (اختياري) إلى Supabase Storage
      const attachmentsPaths = [];
      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const uploadPath = `attachments/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(uploadPath, file);
          if (uploadError) {
            toast.error(t("signupForm.registerError"));
            // eslint-disable-next-line no-console
            console.error("Supabase attachment upload error:", uploadError);
            return;
          }
          attachmentsPaths.push(uploadPath);
        }
      }

      // إنشاء مستخدم في Supabase Auth مع تخزين البيانات في user_metadata
      const { error: supabaseError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role,
            fullName: values.fullName,
            entityTypeId: values.entityType,
            phone: values.phone,
            regionId: values.region,
            commercialRecord: values.commercialRecord,
            commercialRegistrationDate: values.commercialRegistrationDate,
            profilePicturePath,
            attachmentsPaths,
          },
        },
      });

      if (supabaseError) {
        toast.error(
          supabaseError.message || t("signupForm.registerError")
        );
        // eslint-disable-next-line no-console
        console.error("Supabase signUp error:", supabaseError);
        return;
      }

      toast.success(t("signupForm.registerSuccess"));
      navigate("/login");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Signup error:", error);
      toast.error(t("signupForm.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-xl mx-auto rounded-[40px] bg-white text-black pt-5 pb-10 px-4 sm:px-6 md:px-8"
      style={{ boxShadow: "0px 4px 35px 0px rgba(0, 0, 0, 0.08)" }}
    >
      <div className="headForm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-normal text-black text-center sm:text-start">
          {t("signupForm.welcome")}{" "}
          <span className="text-primary font-medium">
            {" "}
            {t("signupForm.appName")}
          </span>
        </h2>
        <div className="create text-center sm:text-end">
          <h3 className="text-[#8D8D8D] text-xs">
            {t("signupForm.haveAccount")}
          </h3>
          <Link className="text-xs text-primary" to={"/login"}>
            {t("signupForm.login")}
          </Link>
        </div>
      </div>

      <h4 className="text-3xl sm:text-4xl md:text-5xl font-medium mt-6 text-center sm:text-start">
        {t("signupForm.title")}
      </h4>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="mt-9 flex flex-col gap-4">
            {/* الاسم الكامل */}
            <div className="flex flex-col gap-4">
              <label>
                <label>
                  {t("signupForm.fullName")}{" "}
                  <span className="text-red-500">*</span>
                </label>
              </label>
              <Field
                type="text"
                name="fullName"
                placeholder={t("signupForm.fullNamePlaceholder")}
                className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 placeholder:text-sm"
              />
              <ErrorMessage
                name="fullName"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.FullName && (
                <div className="text-red-500 text-sm">
                  {apiErrors.FullName[0]}
                </div>
              )}
            </div>

            {/* نوع الكيان */}
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.entityType")}
                <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="entityType"
                className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5"
              >
                <option value="" disabled>
                  {t("signupForm.entityTypePlaceholder")}
                </option>
                {types?.map((item) => (
                  <option value={item?.id} key={item?.id}>
                    {lang === "ar" ? item?.nameAr : item?.nameEn}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="entityType"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.InstitutionTypeLookupId && (
                <div className="text-red-500 text-sm">
                  {apiErrors.InstitutionTypeLookupId[0]}
                </div>
              )}
            </div>

            {/* البريد الالكتروني */}
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.email")} <span className="text-red-500">*</span>
              </label>
              <Field
                type="email"
                name="email"
                placeholder={t("signupForm.emailPlaceholder")}
                className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 placeholder:text-sm"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.Email && (
                <div className="text-red-500 text-sm">{apiErrors.Email[0]}</div>
              )}
            </div>

            {/* رقم الجوال */}
            <div
              className="flex flex-col w-full gap-4"
              style={{ direction: "ltr" }}
            >
              <label style={{ direction: "rtl" }}>
                {t("signupForm.phone")} <span className="text-red-500">*</span>
              </label>

              <PhoneInput
                country={"sa"}
                value={values.phone}
                onChange={(phone) => setFieldValue("phone", phone)}
                inputClass="bg-[#FBFBFB] text-sm !h-[50px] !w-full border-gray-300 focus:ring-1 focus:ring-gray-400"
                containerClass="w-full"
                dropdownClass="text-sm bg-white"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-sm text-right"
              />
              {apiErrors?.PhoneNumber && (
                <div className="text-red-500 text-sm">
                  {apiErrors.PhoneNumber[0]}
                </div>
              )}
            </div>

            {/* المنطقة الجغرافية */}
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.region")}
                <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="region"
                className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5"
              >
                <option value="" disabled>
                  {t("signupForm.regionPlaceholder")}
                </option>
                {addresses?.map((item) => (
                  <option value={item?.id} key={item?.id}>
                    {lang === "ar" ? item?.nameAr : item?.nameEn}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="region"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.Address && (
                <div className="text-red-500 text-sm">
                  {apiErrors.Address[0]}
                </div>
              )}
            </div>

            {/* السجل التجاري */}
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.commercialRecord")}
                <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="commercialRecord"
                placeholder={t("signupForm.commercialRecordPlaceholder")}
                className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5"
              />
              <ErrorMessage
                name="commercialRecord"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.CommercialRegistrationNumber && (
                <div className="text-red-500 text-sm">
                  {apiErrors.CommercialRegistrationNumber[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.commercialDate")}
                <span className="text-red-500">*</span>
              </label>
              <Field
                type="date"
                name="commercialRegistrationDate"
                className="w-full rounded-lg border border-[#ADADAD] py-3 px-5"
              />
              <ErrorMessage
                name="commercialRegistrationDate"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.CommercialRegistrationDate && (
                <div className="text-red-500 text-sm">
                  {apiErrors.CommercialRegistrationDate[0]}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.password")}
                <span className="text-red-500">*</span>
              </label>
              <Field name="password">
                {({ field }) => {
                  const [showPassword, setShowPassword] = useState(false);
                  return (
                    <div className="relative">
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={t("signupForm.passwordPlaceholder")}
                        className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  );
                }}
              </Field>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.Password && (
                <div className="text-red-500 text-sm space-y-1">
                  {apiErrors.Password.map((err, index) => (
                    <div key={index}>{err}</div>
                  ))}
                </div>
              )}
              {apiErrors?.PasswordTooShort && (
                <div className="text-red-500 text-sm">
                  {apiErrors.PasswordTooShort[0]}
                </div>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="flex flex-col gap-4">
              <label>
                {t("signupForm.confirmPassword")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Field name="confirmPassword">
                {({ field }) => {
                  const [showConfirmPassword, setShowConfirmPassword] =
                    useState(false);
                  return (
                    <div className="relative">
                      <input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("signupForm.confirmPasswordPlaceholder")}
                        className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  );
                }}
              </Field>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm"
              />
              {apiErrors?.ConfirmPassword && (
                <div className="text-red-500 text-sm space-y-1">
                  {apiErrors.ConfirmPassword.map((err, index) => (
                    <div key={index}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            {/* رفع المرفقات */}
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
            >
              <img src={fileUpload} alt="" />
              <span className="text-sm font-light">
                {t("signupForm.uploadAttachments")}
              </span>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </label>
            {selectedFiles && selectedFiles.length > 0 && (
              <ul className="mt-2 text-sm text-gray-700 list-disc pr-4 text-right">
                {Array.from(selectedFiles)?.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
            {apiErrors?.AttachmentsGroupKey && (
              <div className="text-red-500 text-sm">
                {apiErrors.AttachmentsGroupKey[0]}
              </div>
            )}

            <label
              htmlFor="profile-picture-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition mt-4"
            >
              <img src={fileUpload} alt="" />
              <span className="text-sm font-light">
                {t("signupForm.uploadProfilePicture")}
              </span>
              <input
                type="file"
                id="profile-picture-upload"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </label>

            {profilePicture && (
              <p className="mt-2 text-sm text-gray-700 text-center">
                {profilePicture.name}
              </p>
            )}

            {apiErrors?.ProfilePicture && (
              <div className="text-red-500 text-sm">
                {apiErrors.ProfilePicture[0]}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Field type="checkbox" name="agreeToTerms" className="w-4 h-4" />
              <label htmlFor="agreeToTerms" className="text-sm">
                <span className="text-red-500">*</span>{" "}
                {t("signupForm.agreeToTerms")}{" "}
                <Link to="#" className="text-primary underline">
                  {t("signupForm.terms")}
                </Link>
              </label>
            </div>
            <ErrorMessage
              name="agreeToTerms"
              component="div"
              className="text-red-500 text-sm"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary h-14 sm:h-16 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t("signupForm.submitting")}</span>
                </>
              ) : (
                buttonText
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupForm;
