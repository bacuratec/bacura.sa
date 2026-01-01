import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAdminSetRequestPriceMutation } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const AdminPricingPanel = ({ refetch }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [adminSetPrice] = useAdminSetRequestPriceMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validationSchema = Yup.object().shape({
    adminPrice: Yup.number().typeError(t("AdminPricingPanel.priceType") || "السعر غير صحيح").required(t("AdminPricingPanel.priceRequired") || "أدخل السعر"),
    adminNotes: Yup.string().nullable(),
    adminProposalFileUrl: Yup.string().url(t("AdminPricingPanel.urlInvalid") || "رابط غير صحيح").nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await adminSetPrice({
        requestId: id,
        adminPrice: values.adminPrice,
        adminNotes: values.adminNotes,
        adminProposalFileUrl: values.adminProposalFileUrl,
      }).unwrap();
      toast.success(t("AdminPricingPanel.success") || "تم حفظ السعر والبيانات");
      refetch && refetch();
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || t("AdminPricingPanel.error") || "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm md:p-3 lg:p-4 xl:p-6 my-5">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("AdminPricingPanel.title") || "تسعير الطلب"}
      </h3>
      <Formik initialValues={{ adminPrice: "", adminNotes: "", adminProposalFileUrl: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="grid gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{t("AdminPricingPanel.price") || "السعر"} <span className="text-red-500">*</span></label>
              <Field name="adminPrice" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder={t("AdminPricingPanel.enterPrice") || "أدخل السعر"} />
              <ErrorMessage name="adminPrice" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{t("AdminPricingPanel.notes") || "ملاحظات"}</label>
              <Field as="textarea" name="adminNotes" className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder={t("AdminPricingPanel.enterNotes") || "أدخل الملاحظات"} />
              <ErrorMessage name="adminNotes" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{t("AdminPricingPanel.proposalUrl") || "رابط ملف العرض"}</label>
              <Field name="adminProposalFileUrl" className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder={t("AdminPricingPanel.enterUrl") || "أدخل الرابط"} />
              <ErrorMessage name="adminProposalFileUrl" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <div className="flex items-center justify-end mt-4">
              <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/80 py-2 px-6 rounded-xl text-white font-medium disabled:opacity-70 text-sm">
                {isSubmitting ? (t("AdminPricingPanel.saving") || "جاري الحفظ...") : (t("AdminPricingPanel.save") || "حفظ")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminPricingPanel;
