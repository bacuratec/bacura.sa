import React, { useEffect, useState } from "react";
import { useNavigate } from "@/utils/useNavigate";
import { useParams } from "@/utils/useParams";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  useGetServiceQuery,
  useUpdateServiceMutation,
  useGetServicesQuery,
  useDeleteServiceMutation,
} from "@/redux/api/servicesApi";
import { useTranslation } from "react-i18next";
import HeadTitle from "../../shared/head-title/HeadTitle";

const UpsertService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const isEdit = Boolean(id);

  const { data, isLoading: isLoadingDetails } = useGetServiceQuery(id, {
    skip: !isEdit,
  });
  const { refetch } = useGetServicesQuery(undefined, { skip: true });
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const [preview, setPreview] = useState(null);

  const initialValues = {
    titleAr: data?.name_ar || "",
    titleEn: data?.name_en || "",
    price: data?.price ?? "",
    isPriced: !!data?.price,
    isActive: data?.is_active !== undefined ? !!data.is_active : true,
    image: null,
    removeImage: false,
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
    image: Yup.mixed().nullable(),
  });

  const handleSubmit = async (values) => {
    try {
      let imageUrl = data?.image_url || null;

      if (values.removeImage && data?.image_url) {
        const { deleteImageFromStorage } = await import("../../../utils/imageUpload");
        await deleteImageFromStorage(data.image_url, "images");
        imageUrl = null;
      } else if (values.image) {
        const { uploadImageToStorage } = await import("../../../utils/imageUpload");
        const uploadedUrl = await uploadImageToStorage(values.image, "images", "services");
        if (!uploadedUrl) {
          return;
        }
        imageUrl = uploadedUrl;
      }

      const body = {
        titleAr: values.titleAr,
        titleEn: values.titleEn,
        price: values.isPriced ? Number(values.price) : null,
        isPriced: values.isPriced,
        isActive: values.isActive,
        imageUrl,
      };

      await updateService({ id, body }).unwrap();
      toast.success(t("services.updateSuccess") || "تم تحديث الخدمة بنجاح");
      refetch?.();
      navigate("/admin/services");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t("services.addService.error") ||
          "حدث خطأ أثناء تحديث الخدمة"
      );
    }
  };
  const handleDelete = async () => {
    try {
      await deleteService(id).unwrap();
      toast.success(t("services.deleteSuccess") || "تم حذف الخدمة بنجاح");
      refetch?.();
      navigate("/admin/services");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t("services.deleteError") ||
          "فشل حذف الخدمة"
      );
    }
  };

  useEffect(() => {
    if (isEdit && data?.image_url) {
      setPreview(data.image_url);
    }
  }, [isEdit, data]);

  if (isEdit && isLoadingDetails) return <p>{t("services.loading") || "جاري التحميل..."}</p>;

  return (
    <div>
      <HeadTitle title={t("services.editService") || "تعديل خدمة"} />
      <div className="mx-auto p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {t("services.editService") || "تعديل الخدمة"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("services.editServiceHint") || "قم بتحديث عناوين الخدمة، السعر، الصورة والحالة."}
            </p>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              title={t("services.delete") || "حذف"}
            >
              {isDeleting ? (t("services.deleting") || "جاري الحذف...") : (t("services.delete") || "حذف")}
            </button>
          )}
        </div>
        <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, touched, errors, setFieldValue }) => (
            <Form>
              <div className="mb-4 border p-3 rounded-lg relative">
                <label className="block text-gray-700 mb-1">
                  {t("services.addService.titleAr") || "العنوان بالعربية"} *
                </label>
                <Field
                  name="titleAr"
                  placeholder={t("services.addService.titleArPlaceholder") || "أدخل العنوان بالعربية"}
                  className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                />
                <p className="text-xs text-gray-500 mb-2">
                  {t("services.addService.titleArHelp") || "استخدم اسمًا واضحًا بالعربية يصف الخدمة بدقة."}
                </p>
                {touched.titleAr && errors.titleAr && (
                  <div className="text-red-500 text-sm mb-2">{errors.titleAr}</div>
                )}

                <label className="block text-gray-700 mb-1">
                  {t("services.addService.titleEn") || "العنوان بالإنجليزية"} *
                </label>
                <Field
                  name="titleEn"
                  placeholder={t("services.addService.titleEnPlaceholder") || "أدخل العنوان بالإنجليزية"}
                  className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                />
                <p className="text-xs text-gray-500 mb-2">
                  {t("services.addService.titleEnHelp") || "استخدم اسمًا واضحًا بالإنجليزية يصف الخدمة بدقة."}
                </p>
                {touched.titleEn && errors.titleEn && (
                  <div className="text-red-500 text-sm mb-2">{errors.titleEn}</div>
                )}

                <label className="flex items-center gap-2 mb-2 mt-4">
                  <Field type="checkbox" name="isPriced" className="w-5 h-5 accent-primary" />
                  <span className="text-gray-700">
                    {t("services.addService.isPriced") || "هل هذه الخدمة لها سعر محدد؟"}
                  </span>
                </label>

                {values.isPriced && (
                  <>
                    <label className="block text-gray-700 mb-1">
                      {t("services.addService.price") || "السعر"} *
                    </label>
                    <Field
                      type="number"
                      name="price"
                      placeholder={t("services.addService.pricePlaceholder") || "أدخل السعر بالريال السعودي"}
                      className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
                    />
                    <p className="text-xs text-gray-500 mb-2">
                      {t("services.addService.priceHelp") || "أدخل قيمة رقمية؛ اتركه فارغًا إذا كانت الخدمة بدون سعر ثابت."}
                    </p>
                    {touched.price && errors.price && (
                      <div className="text-red-500 text-sm mb-2">{errors.price}</div>
                    )}
                  </>
                )}

                <label className="block text-gray-700 mb-1">
                  {t("services.addService.image") || "صورة الخدمة"}
                </label>
                {!preview ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFieldValue("image", file || null);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setPreview(url);
                        setFieldValue("removeImage", false);
                      }
                    }}
                    className="w-full border rounded p-2 bg-primary/10 focus:outline-primary mb-2"
                  />
                ) : (
                  <div className="relative inline-block mt-2 mb-2">
                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFieldValue("image", null);
                        setFieldValue("removeImage", true);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                {!preview && touched.image && errors.image && (
                  <div className="text-red-500 text-sm mt-2">{errors.image}</div>
                )}
                {!preview && (
                  <p className="text-xs text-gray-500 mb-2">
                    {t("services.addService.imageHelp") || "الحد الأقصى 5MB؛ يتم حفظ الصورة في التخزين العام."}
                  </p>
                )}
                {data?.image_url && (
                  <label className="flex items-center gap-2 mt-2">
                    <Field type="checkbox" name="removeImage" className="w-5 h-5 accent-primary" />
                    <span className="text-gray-700">
                      {t("services.removeImage") || "إزالة الصورة الحالية"}
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-2 mb-2 mt-4">
                  <Field type="checkbox" name="isActive" className="w-5 h-5 accent-primary" />
                  <span className="text-gray-700">
                    {t("services.addService.isActive") || "تفعيل الخدمة (ستظهر في الموقع)"}
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdating ? t("services.addService.saving") || "جاري الحفظ..." : t("services.addService.save") || "حفظ"}
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

export default UpsertService;
