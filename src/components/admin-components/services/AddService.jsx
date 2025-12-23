"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  useCreateServiceMutation,
  useGetServicesQuery,
} from "../../../redux/api/servicesApi";
import { useTranslation } from "react-i18next";
import HeadTitle from "../../shared/head-title/HeadTitle";

const AddService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { refetch } = useGetServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();

  const initialValues = {
    titleAr: "",
    titleEn: "",
    price: "",
    isPriced: false,
    isActive: true,
  };

  const validationSchema = Yup.object({
    titleAr: Yup.string().required(
      t("services.addService.titleArRequired") || "العنوان بالعربية مطلوب"
    ),
    titleEn: Yup.string().required(
      t("services.addService.titleEnRequired") || "العنوان بالإنجليزية مطلوب"
    ),
    price: Yup.number()
      .typeError(t("services.addService.priceTypeError") || "السعر يجب أن يكون رقماً")
      .min(0, t("services.addService.priceMin") || "السعر يجب أن يكون أكبر من أو يساوي صفر")
      .when("isPriced", {
        is: true,
        then: (schema) =>
          schema.required(
            t("services.addService.priceRequired") || "السعر مطلوب"
          ),
        otherwise: (schema) => schema.nullable(),
      }),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        titleAr: values.titleAr,
        titleEn: values.titleEn,
        price: values.isPriced ? Number(values.price) : null,
        isPriced: values.isPriced,
        isActive: values.isActive,
      };

      await createService(payload).unwrap();
      toast.success(
        t("services.addService.successAdd") || "تم إضافة الخدمة بنجاح"
      );
      resetForm();
      refetch?.();
      navigate("/admin/services");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          t("services.addService.error") ||
          "حدث خطأ أثناء إضافة الخدمة"
      );
    }
  };

  return (
    <div>
      <HeadTitle title={t("services.addService.title") || "إضافة خدمة"} />
      <div className="mx-auto p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          {t("services.addService.title") || "إضافة خدمة جديدة"}
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, touched, errors }) => (
            <Form>
              <div className="mb-4 border p-3 rounded-lg relative">
                {/* Title Arabic */}
                <label className="block text-gray-700 mb-1">
                  {t("services.addService.titleAr") || "العنوان بالعربية"} *
                </label>
                <Field
                  name="titleAr"
                  placeholder={
                    t("services.addService.titleArPlaceholder") ||
                    "أدخل العنوان بالعربية"
                  }
                  className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                />
                {touched.titleAr && errors.titleAr && (
                  <div className="text-red-500 text-sm mb-2">
                    {errors.titleAr}
                  </div>
                )}

                {/* Title English */}
                <label className="block text-gray-700 mb-1">
                  {t("services.addService.titleEn") || "العنوان بالإنجليزية"} *
                </label>
                <Field
                  name="titleEn"
                  placeholder={
                    t("services.addService.titleEnPlaceholder") ||
                    "أدخل العنوان بالإنجليزية"
                  }
                  className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                />
                {touched.titleEn && errors.titleEn && (
                  <div className="text-red-500 text-sm mb-2">
                    {errors.titleEn}
                  </div>
                )}

                {/* Is Priced */}
                <label className="flex items-center gap-2 mb-2 mt-4">
                  <Field
                    type="checkbox"
                    name="isPriced"
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-gray-700">
                    {t("services.addService.isPriced") ||
                      "هل هذه الخدمة لها سعر محدد؟"}
                  </span>
                </label>

                {/* Price */}
                {values.isPriced && (
                  <>
                    <label className="block text-gray-700 mb-1">
                      {t("services.addService.price") || "السعر"} *
                    </label>
                    <Field
                      type="number"
                      name="price"
                      placeholder={
                        t("services.addService.pricePlaceholder") ||
                        "أدخل السعر بالريال السعودي"
                      }
                      className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                    />
                    {touched.price && errors.price && (
                      <div className="text-red-500 text-sm mb-2">
                        {errors.price}
                      </div>
                    )}
                  </>
                )}

                {/* Is Active */}
                <label className="flex items-center gap-2 mb-2 mt-4">
                  <Field
                    type="checkbox"
                    name="isActive"
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-gray-700">
                    {t("services.addService.isActive") ||
                      "تفعيل الخدمة (ستظهر في الموقع)"}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating
                    ? t("services.addService.saving") || "جاري الحفظ..."
                    : t("services.addService.save") || "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services")}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  {t("services.addService.cancel") || "إلغاء"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddService;
