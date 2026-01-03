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
import { formatCurrency } from "@/utils/currency";

const AdminAssignProviderPanel = ({ data, refetch }) => {
  const { t } = useTranslation();
  const currentProvider = data?.provider;

  const validationSchema = Yup.object().shape({
    providerId: Yup.string().required(t("AdminAssignProvider.providerRequired") || "اختر مزوداً"),
    providerPrice: Yup.number().typeError(t("AdminAssignProvider.priceType") || "سعر غير صحيح").nullable(),
  });

  const [AssignProvider] = useAssignProviderToRequestMutation();
  const { id } = useParams();

  const [triggerSearch] = useLazyGetProvidersAccountsQuery();

  const debouncedLoadProvidersOptions = debounce(async (inputValue, callback) => {
    try {
      const result = await triggerSearch({
        name: inputValue,
        AccountStatus: 104, // Assuming 104 is 'Active' / 'Verified' status for providers
        PageNumber: 1,
        PageSize: 50
      }).unwrap();

      const options = result?.map((provider) => ({
        value: provider.id,
        label: provider.name,
        provider: provider
      }));
      callback(options || []);
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
      // Don't reset if we are just showing the current state
      // resetForm(); 
    } catch (error) {
      toast.error(error?.data?.message || t("AdminAssignProvider.error") || "حدث خطأ أثناء تعيين المزود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {t("AdminAssignProvider.title") || "إدارة مزود الخدمة"}
          </h3>
        </div>
        {currentProvider && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            {t("AdminAssignProvider.assigned") || "تم التعيين"}
          </span>
        )}
      </div>

      {currentProvider && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold">
            {currentProvider.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">{currentProvider.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-gray-400 font-medium">
                {data?.provider_price ? `${formatCurrency(data.provider_price, 'ar')} • ` : ""}
                {t("AdminAssignProvider.activeAssignment") || "المزود المعين حالياً"}
              </span>
            </div>
          </div>
        </div>
      )}

      <Formik
        initialValues={{
          providerId: currentProvider?.id || "",
          providerPrice: data?.provider_price || ""
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="grid gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminAssignProvider.providerLabel") || "اختيار مزود جديد"}
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadProvidersOptions}
                onChange={(option) => setFieldValue("providerId", option?.value || "")}
                placeholder={t("AdminAssignProvider.providerPlaceholder") || "ابحث عن مزود باسمه..."}
                isClearable
                formatOptionLabel={(option) => (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">{option.label}</span>
                      <span className="text-[10px] text-gray-500">
                        {option.provider?.specialization || t("common.noSpecialization") || "بدون تخصص"}
                        {" • "}
                        {option.provider?.city?.name_ar || option.provider?.city?.name_en || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-black text-amber-600">{option.provider?.avg_rate || "0.0"}</span>
                      <svg className="w-2.5 h-2.5 text-amber-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    </div>
                  </div>
                )}
                classNames={{
                  control: () => "!rounded-2xl !border-gray-200 !py-1.5 !shadow-none focus-within:!border-primary/50",
                  option: (state) => state.isFocused ? "!bg-primary/5" : ""
                }}
              />
              <ErrorMessage name="providerId" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminAssignProvider.priceLabel") || "سعر شراء الخدمة"}
              </label>
              <div className="relative">
                <Field
                  name="providerPrice"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder={t("AdminAssignProvider.pricePlaceholder") || "أدخل السعر الذي سيحصل عليه المزود..."}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">SAR</div>
              </div>
              <ErrorMessage name="providerPrice" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (values.providerId === (currentProvider?.id || "") && values.providerPrice === (data?.provider_price || ""))}
              className="w-full premium-gradient-primary text-white py-3.5 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 mt-2"
            >
              {isSubmitting ? (t("AdminAssignProvider.submitting") || "جاري المعالجة...") : (currentProvider ? t("AdminAssignProvider.update") || "تحديث التعيين" : t("AdminAssignProvider.submit") || "تعيين المزود والمتابعة")}
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminAssignProviderPanel;
