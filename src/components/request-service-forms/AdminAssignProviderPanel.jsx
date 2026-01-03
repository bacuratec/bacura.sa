import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";
import { useLazyGetProvidersAccountsQuery } from "@/redux/api/providersApi";
import debounce from "lodash.debounce";
import { useParams } from "next/navigation";
import { useAssignProviderToRequestMutation } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { UserCheck } from "lucide-react";

const AdminAssignProviderPanel = ({ refetch }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    providerId: Yup.string().required(t("AdminAssignProvider.providerRequired") || "اختر مزوداً"),
    providerPrice: Yup.number().typeError(t("AdminAssignProvider.priceType") || "سعر غير صحيح").nullable(),
  });
  const [AssignProvider] = useAssignProviderToRequestMutation();
  const { id } = useParams();

  const [triggerSearch] = useLazyGetProvidersAccountsQuery();
  const debouncedLoadProvidersOptions = debounce(async (inputValue, callback) => {
    try {
      const result = await triggerSearch({ name: inputValue, PageNumber: 1, PageSize: 20 }).unwrap();
      const options = result?.map((provider) => ({
        value: provider.id,
        label: provider.name,
        provider: provider // pass full object
      }));
      callback(options);
    } catch {
      callback([]);
    }
  }, 500);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await AssignProvider({
        requestId: id,
        providerId: values.providerId,
        providerPrice: values.providerPrice,
      }).unwrap();
      toast.success(t("AdminAssignProvider.success") || "تم تعيين المزود بنجاح");
      refetch && refetch();
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || t("AdminAssignProvider.error") || "حدث خطأ أثناء تعيين المزود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UserCheck className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {t("AdminAssignProvider.title") || "تعيين مزود الخدمة"}
        </h3>
      </div>
      <Formik initialValues={{ providerId: "", providerPrice: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, setFieldValue }) => (
          <Form className="grid gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminAssignProvider.providerLabel") || "المزوّد"} <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadProvidersOptions}
                onChange={(option) => setFieldValue("providerId", option?.value || "")}
                placeholder={t("AdminAssignProvider.providerPlaceholder") || "اختر مزوداً"}
                isClearable
                formatOptionLabel={(option) => (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{option.label}</span>
                      <span className="text-xs text-gray-500">
                        {option.provider?.specialization || t("common.noSpecialization") || "بدون تخصص"}
                        {" • "}
                        {option.provider?.city?.name_ar || option.provider?.city?.name_en || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <span className="text-xs font-bold text-amber-600">{option.provider?.avg_rate || "0.0"}</span>
                      <svg className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    </div>
                  </div>
                )}
                classNames={{
                  control: () => "!rounded-xl !border-gray-300 !py-1",
                  option: (state) => state.isFocused ? "!bg-primary/5" : ""
                }}
              />
              <ErrorMessage name="providerId" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{t("AdminAssignProvider.priceLabel") || "سعر المزود"}</label>
              <Field name="providerPrice" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder={t("AdminAssignProvider.pricePlaceholder") || "أدخل السعر للمزوّد (اختياري)"} />
              <ErrorMessage name="providerPrice" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <div className="flex items-center justify-end mt-4">
              <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/80 py-2 px-6 rounded-xl text-white font-medium disabled:opacity-70 text-sm">
                {isSubmitting ? (t("AdminAssignProvider.submitting") || "جاري الحفظ...") : (t("AdminAssignProvider.submit") || "تعيين")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminAssignProviderPanel;
