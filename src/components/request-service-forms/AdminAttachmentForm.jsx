import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import fileUpload from "@/assets/icons/fileUpload.svg";
import axios from "axios";
import { useAdminRequestPriceMutation } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../utils/env";

const AdminAttachmentForm = ({ data, refetch }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    isApproved: Yup.boolean().required(),
    servicePricing: Yup.number()
      .nullable()
      .when("isApproved", {
        is: true,
        then: (schema) =>
          schema
            .typeError(t("AdminAttachmentForm.errorRequiredNumber"))
            .required(t("AdminAttachmentForm.errorPriceRequired"))
            .min(0, t("AdminAttachmentForm.errorPriceNegative")),
      }),
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [AdminRequestPrice] = useAdminRequestPriceMutation();

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        requestId: data?.id,
        isApproved: values.isApproved,
        ...(values.isApproved && { servicePricing: values.servicePricing }),
      };

      if (values.isApproved && selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("attachmentUploaderLookupId", 700);
        uploadFormData.append("requestPhaseLookupId", 801);

        selectedFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });

        await axios.post(
          `${getAppBaseUrl()}api/attachments?groupKey=${
            data?.attachmenstGroupKey
          }`,
          uploadFormData
        );
      }

      await AdminRequestPrice(payload).unwrap();
      toast.success(t("AdminAttachmentForm.operationSuccess"));
      refetch();
      resetForm(); // بيرجع الفورم لقيمته الأولية
      setSelectedFiles([]); // نمسح الملفات المرفوعة من الواجهة
    } catch (error) {
      toast.error(
        error?.data?.message || t("AdminAttachmentForm.operationError") || "حدث خطأ أثناء إضافة المرفقات"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm md:p-3 lg:p-4 xl:p-6 my-5">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("AdminAttachmentForm.uploadAttachments")}
      </h3>

      <Formik
        initialValues={{ isApproved: true, servicePricing: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            {/* رفع المرفقات */}
            <label
              htmlFor="file-upload"
              className="mb-5 flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
            >
              <img src={fileUpload} alt="" />
              <span className="text-sm font-light">
                {t("AdminAttachmentForm.uploadAttachments")}{" "}
                <span className="text-red-500">*</span>
              </span>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </label>

            {selectedFiles.length > 0 && (
              <ul className="mt-2 text-sm text-gray-700 list-disc pr-4 text-right">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}

            {/* حقل السعر */}
            {values.isApproved && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("AdminAttachmentForm.price")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Field
                  name="servicePricing"
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-primary"
                  placeholder={t("AdminAttachmentForm.enterPrice")}
                />
                <ErrorMessage
                  name="servicePricing"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            <div className="mt-5 flex items-center justify-center md:justify-end gap-2 md:gap-3">
              {/* زر الرفض */}
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setFieldValue("isApproved", false)}
                className="bg-[#F61A1E] transition-all duration-300 hover:bg-[#F61A1E]/80 py-2 px-4 md:px-5 lg:px-6 xl:px-8 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70 text-xs md:text-sm lg:text-base"
              >
                {isSubmitting && values.isApproved === false ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t("AdminAttachmentForm.sendingReject")}</span>
                  </>
                ) : (
                  t("AdminAttachmentForm.reject")
                )}
              </button>

              {/* زر القبول */}
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || isSubmitting}
                onClick={() => setFieldValue("isApproved", true)}
                className="bg-primary transition-all duration-300 hover:bg-primary/80 py-2 px-4 md:px-5 lg:px-6 xl:px-8 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70 text-xs md:text-sm lg:text-base"
              >
                {isSubmitting && values.isApproved === true ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t("AdminAttachmentForm.sendingApproval")}</span>
                  </>
                ) : (
                  t("AdminAttachmentForm.acceptAndSend")
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminAttachmentForm;
