import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import fileUpload from "../../../assets/icons/fileUpload.svg";
import { usePathname, useRouter } from "next/navigation";
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

const RequestForm = ({ services }) => {
  const pathname = usePathname();
  const router = useRouter();
  const itemId = null;

  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const validationSchema = Yup.object({
    selectedServices: Yup.array()
      .min(1, t("formRequest.validation.selectAtLeastOne"))
      .required(t("formRequest.validation.selectAtLeastOne")),
    description: Yup.string().required(
      t("formRequest.validation.descriptionRequired")
    ),
    agreeToTerms: Yup.bool().oneOf(
      [true],
      t("formRequest.validation.agreeRequired")
    ),
    attachment: Yup.mixed()
      .nullable()
      .test("fileSize", t("formRequest.validation.fileTooLarge"), (value) => {
        return !value || (value && value.size <= 5 * 1024 * 1024);
      }),
  });
  const [showPayment, setShowPayment] = useState(null);

  const userId = useSelector((state) => state.auth.userId);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const navigate = useNavigate();
  const [createOrder, { isLoading: loadingCreateOrder }] =
    useCreateOrderMutation();
  const [createOrderPriced, { isLoading: loadingCreateOrderPriced }] =
    useCreateOrderPricedMutation();

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const initialValues = {
    selectedServices: itemId ? [String(itemId)] : [], // نضيفه هنا
    description: "",
    // budget: "",
    attachment: null,
    agreeToTerms: false,
  };

  // دالة تساعدنا نعرف هل فيه خدمة isPriced مختارة
  const isAnyPricedSelected = (selectedServices) => {
    if (!selectedServices) return false;
    return selectedServices.some((id) => {
      const service = services.find((s) => String(s.id) === id);
      return service?.isPriced === true;
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

  const onSubmit = async (values) => {
    try {
      const hasPricedService = isAnyPricedSelected(values.selectedServices);

      // 1. إنشاء Group Key باستخدام Supabase RPC
      const groupKey = await createAttachmentGroupKey();
      if (!groupKey) {
        toast.error("فشل في إنشاء group key للمرفقات");
        return;
      }

      // 2. جهز بيانات الريجيستر كـ FormData
      const payload = {
        services: values.selectedServices,
        attachmenstGroupKey: groupKey,
        description: values.description,
        requesterId: userId,
        isTermsAccepted: values.agreeToTerms,
      };

      // 3. ارفع الملفات فقط لو فيه ملفات
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
        const pricedService = services.find(
          (s) => values.selectedServices.includes(String(s.id)) && s.isPriced
        );
        setShowPayment({
          amount: pricedService.price, // Stripe uses cents
          consultationId: orderId, // we'll use it to link payment to the order
          // consultationId: pricedService?.id, // we'll use it to link payment to the order
        });

        return; // ما نكملش التسجيل دلوقتي
      }
      // ******************** stripe  *********************
      // 4. التسجيل
      else {
        await createOrder(payload).unwrap();
        toast.success(t("formRequest.messages.successUpload"));
      }
      router.push("/");
    } catch (error) {
      toast.error(
        error?.data?.message || t("formRequest.messages.registrationError") || "حدث خطأ أثناء إنشاء الطلب"
      );
      if (error?.data?.errors) {
        // setApiErrors(error.data.errors);
      } else if (error?.data) {
        // setApiErrors(error.data);
      }
      toast.error(t("formRequest.messages.errorUpload"));
    }
  };

  return (
    <div
      className="rounded-[40px] bg-white basis-1/2 text-black pt-5 pb-10 px-6"
      style={{
        boxShadow: "0px 4px 35px 0px rgba(0, 0, 0, 0.08)",
        direction: "rtl",
      }}
    >
      <h4 className="text-5xl font-medium mt-6">
        {t("formRequest.requestService")}
      </h4>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => {
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
            <Form className="mt-9 flex flex-col gap-3">
              <p className="text-sm font-medium text-black mt-4">
                {t("formRequest.requiredServices")}{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-col gap-3 ltr:items-end">
                {services?.map((item) => {
                  // لو فيه خدمة isPriced مختارة، الخدمات اللي مش هي دي تبقى disabled
                  const disabled = anyPriced
                    ? !values.selectedServices.includes(String(item.id))
                    : anySelectable
                    ? !item.isSelectable &&
                      !values.selectedServices.includes(String(item.id))
                    : anySelect
                    ? !values.selectedServices.includes(String(item.id))
                    : false;
                  return (
                    <div key={item?.id}>
                      <label className="text-sm font-normal text-[#333] flex items-center ltr:flex-row-reverse gap-3">
                        <input
                          type="checkbox"
                          name="selectedServices"
                          value={String(item?.id)}
                          checked={values.selectedServices.includes(
                            String(item?.id)
                          )}
                          onChange={handleCheckboxChange}
                          className="w-5 h-5 accent-primary"
                          disabled={disabled}
                        />
                        {lang === "ar" ? item?.titleAr : item?.titleEn}
                      </label>
                    </div>
                  );
                })}
              </div>
              <ErrorMessage
                name="selectedServices"
                component="div"
                className="text-red-500 text-sm"
              />

              <div className="flex flex-col gap-4">
                <label htmlFor="description">
                  {t("formRequest.descriptionLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="description"
                  className="w-full resize-none rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-normal"
                  placeholder={t("formRequest.descriptionLabel")}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {anyPriced && (
                <div className="flex flex-col gap-4">
                  <label htmlFor="budget">{t("formRequest.budgetLabel")}</label>
                  <input
                    type="number"
                    name="budget"
                    placeholder={t("formRequest.budgetPlaceholder")}
                    className="w-full rounded-lg border border-[#ADADAD] focus:border-[#4285F4] outline-none py-3 px-5 placeholder:text-sm placeholder:text-[#808080] placeholder:font-normal bg-gray-100 cursor-not-allowed"
                    disabled
                    value={(() => {
                      const pricedServiceId = values.selectedServices.find(
                        (id) => {
                          const svc = services.find((s) => String(s.id) === id);
                          return svc?.isPriced;
                        }
                      );
                      const pricedService = services.find(
                        (s) => String(s.id) === pricedServiceId
                      );
                      return pricedService ? pricedService.price : "";
                    })()}
                  />
                  <ErrorMessage
                    name="budget"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4">
                <label className="font-medium text-sm">
                  {t("formRequest.attachmentsLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
                >
                  <img src={fileUpload} alt="" />
                  <span className="text-sm font-normal">
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
                <ul className="mt-2 text-sm text-gray-700 list-disc pr-4 text-right">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Field
                  type="checkbox"
                  name="agreeToTerms"
                  className="w-4 h-4"
                />
                <label htmlFor="agreeToTerms" className="text-sm">
                  <span className="text-red-500">*</span>{" "}
                  {t("formRequest.agreeTerms")}{" "}
                  <span to="#" className="text-primary underline">
                    {t("formRequest.termsAndConditions")}
                  </span>
                </label>
              </div>
              <ErrorMessage
                name="agreeToTerms"
                component="div"
                className="text-red-500 text-sm"
              />

              {!showPayment && (
                <button
                  type="submit"
                  className="bg-primary py-3 rounded-lg text-white font-bold hover:bg-primary/80 transition-all duration-300"
                >
                  {loadingCreateOrder || loadingCreateOrderPriced ? (
                    <>
                      <span className="loader"></span>
                      <span>{t("formRequest.submitting")}</span>
                    </>
                  ) : (
                    t("formRequest.submitButton")
                  )}
                </button>
              )}
            </Form>
          );
        }}
      </Formik>
      {showPayment && (
        <div className="mt-6">
          <PaymentForm
            amount={showPayment.amount}
            consultationId={showPayment.consultationId}
          />
        </div>
      )}
    </div>
  );
};

export default RequestForm;
