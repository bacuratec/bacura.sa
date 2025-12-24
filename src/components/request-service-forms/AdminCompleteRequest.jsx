import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Select from "react-select";
import { useAdminCompleteRequestMutation } from "../../redux/api/ordersApi";
import AsyncSelect from "react-select/async";
import { useLazyGetProvidersAccountsQuery } from "../../redux/api/providersApi";
import debounce from "lodash.debounce";
import fileUpload from "@/assets/icons/fileUpload.svg";
import { useState } from "react";
import axios from "axios";
import { useAddOrderAttachmentsMutation } from "../../redux/api/projectsApi";
import { useTranslation } from "react-i18next";

const AdminCompleteRequest = ({ data, refetch }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    requestTitle: Yup.string().required(t("AdminCompleteRequest.errorRequestTitleRequired")),
    startDate: Yup.date().required(t("AdminCompleteRequest.errorStartDateRequired")),
    endDate: Yup.date()
      .required(t("AdminCompleteRequest.errorEndDateRequired"))
      .min(Yup.ref("startDate"), t("AdminCompleteRequest.errorEndDateMin")),
    providerId: Yup.string().required(t("AdminCompleteRequest.errorProviderRequired")),
    orderPrice: Yup.number()
      .typeError(t("AdminCompleteRequest.errorPriceType"))
      .required(t("AdminCompleteRequest.errorPriceRequired"))
      .min(0, t("AdminCompleteRequest.errorPriceMin")),
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const [AdminCompleteRequest] = useAdminCompleteRequestMutation();
  const [addOrderAttachments] = useAddOrderAttachmentsMutation();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const groupRes = await axios.get(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }api/attachments/new-attachments-group-key`
      );
      const groupKey = groupRes.data;

      const payload = {
        requestId: data?.id,
        isCompleted: true,
        orderTitle: values.requestTitle,
        startDate: values.startDate,
        endDate: values.endDate,
        providers: [values.providerId],
        orderPrice: values.orderPrice, // ➕ أضفت السعر هنا
      };
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("attachmentUploaderLookupId", 700);
        uploadFormData.append("requestPhaseLookupId", 803);
        for (let i = 0; i < selectedFiles.length; i++) {
          uploadFormData.append("files", selectedFiles[i]);
        }
        await axios.post(
          `${
            import.meta.env.VITE_APP_BASE_URL
          }api/attachments?groupKey=${groupKey}`,
          uploadFormData
        );
      }
      const res = await AdminCompleteRequest(payload).unwrap();
      await addOrderAttachments({
        body: { attachmentsGroupKey: groupKey },
        projectId: res,
      }).unwrap();

      toast.success(t("AdminCompleteRequest.operationSuccess"));
      refetch();
      resetForm();
    } catch (error) {
      toast.error(
        error?.data?.message || t("AdminCompleteRequest.operationError") || "حدث خطأ أثناء إتمام الطلب"
      );
    } finally {
      setSubmitting(false);
    }
  };
  const [triggerSearch] = useLazyGetProvidersAccountsQuery();

  const debouncedLoadProvidersOptions = debounce(
    async (inputValue, callback) => {
      try {
        const result = await triggerSearch({
          name: inputValue,
          PageNumber: 1,
          PageSize: 10,
        }).unwrap();

        const options = result?.map((provider) => ({
          value: provider.id,
          label: provider.name,
        }));

        callback(options);
      } catch {
        callback([]);
      }
    },
    500
  ); // ⏳ 500ms تأخير بعد ما يوقف المستخدم عن الكتابة

  return (
    <section className="rounded-2xl bg-white shadow-sm md:p-3 lg:p-4 xl:p-6 my-5">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("AdminCompleteRequest.confirmRequest")}
      </h3>

      <Formik
        initialValues={{
          requestTitle: "",
          startDate: "",
          endDate: "",
          providerId: "",
          orderPrice: "", // ➕ أضفت السعر هنا
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="grid gap-4">
            {/* عنوان الطلب */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminCompleteRequest.requestTitle")} <span className="text-red-500">*</span>
              </label>
              <Field
                name="requestTitle"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                placeholder={t("AdminCompleteRequest.enterRequestTitle")}
              />
              <ErrorMessage
                name="requestTitle"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminCompleteRequest.price")} <span className="text-red-500">*</span>
              </label>
              <Field
                name="orderPrice"
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                placeholder={t("AdminCompleteRequest.enterOrderPrice")}
              />
              <ErrorMessage
                name="orderPrice"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* تاريخ البداية */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminCompleteRequest.startDate")} <span className="text-red-500">*</span>
              </label>
              <Field
                name="startDate"
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              />
              <ErrorMessage
                name="startDate"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* تاريخ النهاية */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminCompleteRequest.endDate")} <span className="text-red-500">*</span>
              </label>
              <Field
                name="endDate"
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              />
              <ErrorMessage
                name="endDate"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* اختيار مقدم الخدمة */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("AdminCompleteRequest.provider")} <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadProvidersOptions}
                onChange={(option) => setFieldValue("providerId", option.value)}
                placeholder={t("AdminCompleteRequest.selectProvider")}
                isClearable
              />
              <ErrorMessage
                name="providerId"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="file-upload"
                className="mb-5 flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
              >
                <img src={fileUpload} alt="" />
                <span className="text-sm font-light">
                  {t("AdminCompleteRequest.uploadAttachments")}{" "}
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
            </div>
            {/* زر التأكيد */}
            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/80 py-2 px-6 rounded-xl text-white font-medium disabled:opacity-70 text-sm"
              >
                {isSubmitting ? t("AdminCompleteRequest.sending") : t("AdminCompleteRequest.confirm")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminCompleteRequest;
