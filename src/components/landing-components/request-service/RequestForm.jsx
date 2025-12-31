import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import fileUpload from "../../../assets/icons/fileUpload.svg";
import { useRouter } from "next/navigation";
import {
  useCreateOrderMutation,
  useCreateOrderPricedMutation,
} from "../../../redux/api/ordersApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import PaymentForm from "./PaymentForm";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { createAttachmentGroupKey, uploadAttachmentsToStorage } from "@/utils/attachmentUtils";
import { supabase } from "@/lib/supabaseClient";
import StepWizard from "./StepWizard";
import { ArrowRight, ArrowLeft } from "lucide-react";
import MoyasarInvoiceButton from "./MoyasarInvoiceButton";

const RequestForm = ({ services }) => {
  const router = useRouter();
  const itemId = null;

  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: t("formRequest.steps.services") || "الخدمات" },
    { id: 2, label: t("formRequest.steps.details") || "التفاصيل" },
    { id: 3, label: t("formRequest.steps.attachments") || "المرفقات" },
    { id: 4, label: t("formRequest.steps.review") || "المراجعة" },
  ];

  const validationSchema = [
    // Step 1: Services
    Yup.object({
      selectedServices: Yup.array()
        .min(1, t("formRequest.validation.selectAtLeastOne"))
        .required(t("formRequest.validation.selectAtLeastOne")),
    }),
    // Step 2: Details
    Yup.object({
      description: Yup.string().required(
        t("formRequest.validation.descriptionRequired")
      ),
    }),
    // Step 3: Attachments (Optional but validated if present)
    Yup.object({
      attachment: Yup.mixed()
        .nullable()
        .test("fileSize", t("formRequest.validation.fileTooLarge"), (value) => {
          return !value || (value && value.size <= 5 * 1024 * 1024);
        }),
    }),
    // Step 4: Review & Terms
    Yup.object({
      agreeToTerms: Yup.bool().oneOf(
        [true],
        t("formRequest.validation.agreeRequired")
      ),
    }),
  ];

  const currentValidationSchema = validationSchema[currentStep - 1];

  const [showPayment, setShowPayment] = useState(null);

  const userId = useSelector((state) => state.auth.userId);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [createOrder, { isLoading: loadingCreateOrder }] =
    useCreateOrderMutation();
  const [createOrderPriced, { isLoading: loadingCreateOrderPriced }] =
    useCreateOrderPricedMutation();

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const initialValues = {
    selectedServices: itemId ? [String(itemId)] : [],
    description: "",
    attachment: null,
    agreeToTerms: false,
  };

  const isAnyPricedSelected = (selectedServices) => {
    if (!selectedServices) return false;
    return selectedServices.some((id) => {
      const service = services.find((s) => String(s.id) === id);
      return !!service && typeof service.base_price === "number" && service.base_price > 0;
    });
  };
  const isAnyServicesSelect = (selectedServices) => {
    if (!selectedServices) return false;
    return selectedServices.some((id) => {
      const service = services.find((s) => String(s.id) === id);
      return service?.isSelectable !== true;
    });
  };
  const isAnyServicesSelectable = (selectedServices) => {
    if (!selectedServices) return false;
    return selectedServices.some((id) => {
      const service = services.find((s) => String(s.id) === id);
      return service?.isSelectable === true;
    });
  };

  const handleNext = async (validateForm, setTouched) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      setTouched(errors); // Mark fields as touched to show errors
      toast.error(t("formRequest.validation.fixErrors") || "يرجى تصحيح الأخطاء للمتابعة");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values) => {
    try {
      const hasPricedService = isAnyPricedSelected(values.selectedServices);

      // 1. إنشاء Group Key باستخدام Supabase RPC
      const groupKey = await createAttachmentGroupKey();
      if (!groupKey) {
        toast.error("فشل في إنشاء group key للمرفقات");
        return;
      }

      // 2. جلب requester_id من جدول requesters باستخدام userId
      const { data: requesterRow, error: requesterErr } = await supabase
        .from("requesters")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (requesterErr || !requesterRow?.id) {
        toast.error("تعذر تحديد هوية طالب الخدمة");
        return;
      }
      const requesterId = requesterRow.id;

      // 3. تحديد الخدمة المختارة (قاعدة: طلب واحد مرتبط بخدمة واحدة)
      const selectedServiceId = values.selectedServices?.[0];
      const selectedService = services.find((s) => String(s.id) === String(selectedServiceId));
      if (!selectedServiceId || !selectedService) {
        toast.error("يجب اختيار خدمة واحدة على الأقل");
        return;
      }

      // 4. جلب status_id حسب نوع الخدمة
      await supabase
        .from("lookup_types")
        .select("id")
        .eq("code", "requester-entity-types") // placeholder to ensure table exists
        .maybeSingle();
      const { data: reqStatusType } = await supabase
        .from("lookup_types")
        .select("id")
        .eq("code", "request-status")
        .single();
      const statusCode = hasPricedService ? "priced" : "pending";
      const { data: statusRow } = await supabase
        .from("lookup_values")
        .select("id")
        .eq("lookup_type_id", reqStatusType.id)
        .eq("code", statusCode)
        .single();
      const statusId = statusRow?.id;
      if (!statusId) {
        toast.error("تعذر تحديد حالة الطلب");
        return;
      }

      // 5. تجهيز العنوان
      const title =
        (lang === "ar" ? selectedService?.name_ar : selectedService?.name_en) ||
        (selectedService?.titleAr || selectedService?.titleEn) ||
        "طلب خدمة";

      // 6. جهز بيانات الطلب
      const payload = {
        requesterId,
        serviceId: selectedServiceId,
        title,
        description: values.description,
        statusId,
        attachmentsGroupKey: groupKey,
      };

      // 7. ارفع الملفات فقط لو فيه ملفات
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadSuccess = await uploadAttachmentsToStorage(
          selectedFiles,
          groupKey,
          702, // attachmentUploaderLookupId للـ Requester
          800  // requestPhaseLookupId لمرحلة الطلب الأولية
        );
        if (!uploadSuccess) {
          toast.error("فشل في رفع بعض الملفات");
        }
      }

      // ******************** stripe  *********************
      if (hasPricedService) {
        const orderRes = await createOrderPriced(payload).unwrap();
        const orderId = orderRes.id;
        const pricedService = selectedService;
        setShowPayment({
          amount: pricedService.base_price, // Stripe uses cents
          consultationId: orderId, // we'll use it to link payment to the order
        });

        return; // ما نكملش التسجيل دلوقتي
      }
      // ******************** stripe  *********************
      // 8. التسجيل
      else {
        await createOrder(payload).unwrap();
        toast.success(t("formRequest.messages.successUpload"));
      }
      router.push("/");
    } catch (error) {
      toast.error(
        error?.data?.message || t("formRequest.messages.registrationError") || "حدث خطأ أثناء إنشاء الطلب"
      );
      toast.error(t("formRequest.messages.errorUpload"));
    }
  };

  return (
    <div
      className="rounded-[32px] bg-white basis-1/2 text-black pt-8 pb-10 px-6 sm:px-8 border border-gray-100"
      style={{
        boxShadow: "0px 10px 40px -10px rgba(0, 0, 0, 0.08)",
        direction: "rtl",
      }}
    >
      <h4 className="text-2xl md:text-3xl font-bold mt-2 mb-6 text-center text-gray-800">
        {t("formRequest.requestService")}
      </h4>
      <div className="w-20 h-1 bg-primary/20 mx-auto mb-8 rounded-full"></div>

      <StepWizard currentStep={currentStep} steps={steps} />

      <Formik
        initialValues={initialValues}
        validationSchema={currentValidationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, validateForm, setTouched }) => {
          const anyPriced = isAnyPricedSelected(values.selectedServices);
          const anySelect = isAnyServicesSelect(values.selectedServices);
          const anySelectable = isAnyServicesSelectable(
            values.selectedServices
          );

          const handleCheckboxChange = (e) => {
            const { value, checked } = e.target;
            let selected = [...values.selectedServices];

            const clickedService = services.find((s) => String(s.id) === value);
            const isClickedSelectable = clickedService?.isSelectable;

            const isClickedPriced = clickedService?.isPriced;

            // عند الاختيار
            if (checked) {
              // لو الخدمة isPriced
              if (isClickedPriced) {
                selected = [value];
              }
              // لو الخدمة isSelectable فقط
              else if (isClickedSelectable) {
                // شيل أي خدمة مش isSelectable
                selected = selected.filter((id) => {
                  const service = services.find((s) => String(s.id) === id);
                  return service?.isSelectable;
                });
                selected.push(value);
              }
              // لو مش isSelectable
              else {
                // ممنوع تضيف لو فيه خدمات isSelectable مختارة
                if (isAnyServicesSelectable(selected)) return;
                selected.push(value);
              }
            } else {
              // عند الإزالة
              selected = selected.filter((id) => id !== value);
            }

            setFieldValue("selectedServices", selected);
            if (selected.length === 0) setFieldValue("budget", "");
          };

          return (
            <Form className="mt-4 flex flex-col gap-6 min-h-[300px]">

              {/* Step 1: Services Selection */}
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <p className="text-lg font-medium text-black mb-4">
                    {t("formRequest.requiredServices")}{" "}
                    <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-col gap-3 ltr:items-end max-h-[400px] overflow-y-auto pr-2">
                    {services?.map((item) => {
                      const disabled = anyPriced
                        ? !values.selectedServices.includes(String(item.id))
                        : anySelectable
                          ? !item.isSelectable &&
                          !values.selectedServices.includes(String(item.id))
                          : anySelect
                            ? !values.selectedServices.includes(String(item.id))
                            : false;
                      return (
                        <div key={item?.id} className={`p-3 border rounded-xl transition-all hover:bg-gray-50 ${values.selectedServices.includes(String(item?.id)) ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-gray-200'}`}>
                          <label className="text-sm font-normal text-[#333] flex items-center ltr:flex-row-reverse gap-3 cursor-pointer w-full">
                            <input
                              type="checkbox"
                              name="selectedServices"
                              value={String(item?.id)}
                              checked={values.selectedServices.includes(String(item?.id))}
                              onChange={handleCheckboxChange}
                              className="w-5 h-5 accent-primary"
                              disabled={disabled}
                            />
                            {(item?.imageUrl || item?.image_url) && (
                              <img
                                src={item.imageUrl || item.image_url}
                                alt="service"
                                className="w-10 h-10 rounded object-cover border"
                              />
                            )}
                            <span className="flex-1 font-medium text-base">
                              {(lang === "ar" ? item?.titleAr : item?.titleEn) || (lang === "ar" ? item?.name_ar : item?.name_en) || item?.title || "خدمة"}
                            </span>
                            {item.price && (
                              <span className="text-primary font-bold text-sm">
                                {item.price} ر.س
                              </span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <ErrorMessage
                    name="selectedServices"
                    component="div"
                    className="text-red-500 text-sm mt-2"
                  />
                </div>
              )}

              {/* Step 2: Description & Details */}
              {currentStep === 2 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="font-medium text-lg">
                      {t("formRequest.descriptionLabel")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full h-40 resize-none rounded-xl border border-[#ADADAD] focus:border-primary focus:ring-1 focus:ring-primary outline-none py-4 px-5 text-base"
                      placeholder={t("formRequest.descriptionPlaceholder") || "اشرح تفاصيل طلبك بدقة..."}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  {anyPriced && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="budget" className="font-medium text-lg">{t("formRequest.budgetLabel")}</label>
                      <input
                        type="number"
                        name="budget"
                        inputMode="numeric"
                        disabled
                        className="w-full rounded-xl border border-[#ADADAD] bg-gray-100 py-3 px-5 text-gray-500 cursor-not-allowed"
                        value={(() => {
                          const pricedServiceId = values.selectedServices.find(
                            (id) => {
                              const svc = services.find((s) => String(s.id) === id);
                              return typeof svc?.base_price === "number" && svc.base_price > 0;
                            }
                          );
                          const pricedService = services.find(
                            (s) => String(s.id) === pricedServiceId
                          );
                          return pricedService ? pricedService.base_price : "";
                        })()}
                      />
                      <p className="text-xs text-gray-500">{t("formRequest.fixedPriceNote") || "هذه الخدمة لها سعر ثابت"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Attachments */}
              {currentStep === 3 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <label className="font-medium text-lg">
                      {t("formRequest.attachmentsLabel")}
                    </label>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-2xl px-4 py-16 cursor-pointer text-center text-[#808080] hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                        <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt={t("formRequest.attachmentsLabel")} className="w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                      </div>
                      <span className="text-base font-medium text-gray-700 mb-1">
                        {t("formRequest.clickToUpload") || "اضغط لرفع الملفات"}
                      </span>
                      <span className="text-sm text-gray-400">
                        {t("formRequest.attachmentsPlaceholder")}
                      </span>
                      <input
                        id="file-upload"
                        name="attachment"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                    </label>
                    <ErrorMessage
                      name="attachment"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="text-sm font-bold text-gray-700 mb-2">{t("formRequest.selectedFiles") || "الملفات المختارة"}:</h5>
                      <ul className="text-sm text-gray-600 list-disc pr-4 space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-xl text-gray-800 border-b pb-2">{t("formRequest.summary") || "ملخص الطلب"}</h3>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.steps.services")}</span>
                      <div className="flex flex-wrap gap-2">
                        {values.selectedServices.map(id => {
                          const s = services.find(srv => String(srv.id) === id);
                          return (
                            <span key={id} className="bg-white border px-3 py-1 rounded-full text-sm font-medium text-primary">
                              {lang === "ar" ? s?.titleAr : s?.titleEn}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.descriptionLabel")}</span>
                      <p className="text-gray-800 bg-white p-3 rounded-lg border text-sm whitespace-pre-wrap">
                        {values.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.attachmentsLabel")}</span>
                      <p className="text-gray-800 text-sm">
                        {selectedFiles?.length > 0 ? `${selectedFiles.length} ${t("files") || "ملفات"}` : t("noFiles") || "لا توجد مرفقات"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Field
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      className="w-5 h-5 mt-0.5 accent-primary"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                      {t("formRequest.agreeTerms")}{" "}
                      <span className="text-primary font-bold hover:underline">
                        {t("formRequest.termsAndConditions")}
                      </span>
                    </label>
                  </div>
                  <ErrorMessage
                    name="agreeToTerms"
                    component="div"
                    className="text-red-500 text-sm px-2"
                  />

                  {!showPayment && (
                    <button
                      type="submit"
                      className="w-full bg-primary py-4 rounded-xl text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                      disabled={loadingCreateOrder || loadingCreateOrderPriced}
                    >
                      {loadingCreateOrder || loadingCreateOrderPriced ? (
                        <>
                          <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>{t("formRequest.submitting")}...</span>
                        </>
                      ) : (
                        t("formRequest.submitButton")
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRight size={20} className="rtl:rotate-180" />
                    {t("back") || "السابق"}
                  </button>
                ) : (
                  <div></div> // Spacer
                )}

                {currentStep < steps.length && (
                  <button
                    type="button"
                    onClick={() => handleNext(validateForm, setTouched)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
                  >
                    {t("next") || "التالي"}
                    <ArrowLeft size={20} className="rtl:rotate-180" />
                  </button>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>

      {showPayment && (
        <div className="mt-8 border-t pt-8 animate-fadeIn">
          <h3 className="text-xl font-bold mb-4 text-center">{t("payment.title") || "الدفع"}</h3>
          <PaymentForm
            amount={showPayment.amount}
            consultationId={showPayment.consultationId}
          />
          <div className="mt-4">
            {/* بديل للدفع عبر Moyasar */}
            <MoyasarInvoiceButton
              amount={showPayment.amount}
              orderId={showPayment.consultationId}
              userId={userId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
