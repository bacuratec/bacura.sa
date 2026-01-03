import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAdminSetRequestPriceMutation, useAdminMarkRequestPaidMutation, useGetRequestDetailsQuery } from "@/redux/api/ordersApi";
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

      {/* Cash Payment / Mark as Paid Action */}
      <AdminMarkPaidAction requestId={id} refetch={refetch} />
    </section >
  );
};

// Sub-component for Marking as Paid
const AdminMarkPaidAction = ({ requestId, refetch }) => {
  const { t } = useTranslation();
  const [markPaid, { isLoading }] = useAdminMarkRequestPaidMutation();
  const { data: requestData } = useGetRequestDetailsQuery(requestId);

  // Show only if status is priced or waiting-payment (by code)
  const canMarkPaid = ["priced", "waiting-payment", "waiting_payment"].includes(requestData?.status?.code);

  if (!canMarkPaid) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <div>
          <h4 className="font-bold text-yellow-800">{t("AdminPricingPanel.cashPayment") || "الدفع الكاش / تحويل بنكي"}</h4>
          <p className="text-sm text-yellow-700 mt-1">
            {t("AdminPricingPanel.markPaidDesc") || "يمكنك تحديث حالة الطلب إلى 'مدفوع' يدوياً في حال استلام المبلغ نقداً أو عبر تحويل."}
          </p>
        </div>
        <button
          onClick={async () => {
            if (window.confirm(t("AdminPricingPanel.confirmMarkPaid") || "هل أنت متأكد من تغيير الحالة إلى مدفوع؟")) {
              await markPaid(requestId).unwrap();
              toast.success(t("AdminPricingPanel.markedPaid") || "تم تحديث الحالة إلى مدفوع");
              refetch && refetch();
            }
          }}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
        >
          {isLoading ? "..." : (t("AdminPricingPanel.markAsPaid") || "تحديد كـ مدفوع")}
        </button>
      </div>
    </div>
  );
};

export default AdminPricingPanel;
