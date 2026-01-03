import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAdminSetRequestPriceMutation, useAdminMarkRequestPaidMutation, useGetRequestDetailsQuery } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DollarSign } from "lucide-react";

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
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <DollarSign className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {t("AdminPricingPanel.title") || "تسعير الطلب"}
        </h3>
      </div>
      <Formik initialValues={{ adminPrice: "", adminNotes: "", adminProposalFileUrl: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="grid gap-5">
            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.price") || "قيمة العرض المالي"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Field
                  name="adminPrice"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-lg font-bold text-primary focus:border-primary/50 transition-all outline-none pl-12"
                  placeholder="0.00"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">SAR</div>
              </div>
              <ErrorMessage name="adminPrice" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.notes") || "ملاحظات إضافية"}
              </label>
              <Field
                as="textarea"
                name="adminNotes"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm min-h-[100px] focus:border-primary/50 transition-all outline-none"
                placeholder={t("AdminPricingPanel.enterNotes") || "أدخل أية تفاصيل أو اشتراطات للملف..."}
              />
              <ErrorMessage name="adminNotes" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.proposalUrl") || "رابط العرض الفني (Drive/Dropbox)"}
              </label>
              <Field
                name="adminProposalFileUrl"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-primary/50 transition-all outline-none"
                placeholder="https://..."
              />
              <ErrorMessage name="adminProposalFileUrl" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full premium-gradient-secondary text-white py-3.5 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-secondary/30 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (t("AdminPricingPanel.saving") || "جاري الحفظ...") : (t("AdminPricingPanel.save") || "حفظ وإرسال العرض")}
            </button>
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
