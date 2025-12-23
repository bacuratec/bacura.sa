/* eslint-disable no-constant-binary-expression */
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useCallback, useContext, useRef, useState } from "react";
import * as Yup from "yup";
import fileIcon from "@/assets/icons/selectImg.svg";
import camIcon from "@/assets/icons/cam.svg";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // استيراد التصميم الافتراضي
import toast from "react-hot-toast";
// import { updateUserProfile } from "../../rtk/slices/userSlice";
import { useSelector } from "react-redux";
import { useGetCitiesQuery } from "../../../redux/api/citiesApi";
import fileUpload from "@/assets/icons/fileUpload.svg";

import {
  useUpdateAdminMutation,
  useUpdateProviderMutation,
  useUpdateRequesterMutation,
} from "../../../redux/api/updateApi";
import {
  useGetProviderEntityTypesQuery,
  useGetRequesterEntityTypesQuery,
} from "../../../redux/api/typeApi";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

export default function ProfileModal({ open, setOpen, data, refetch }) {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const [isChanges, setIsChanged] = useState(false);
  const role = useSelector((state) => state.auth.role);
  const validationSchema = Yup.object({
    FullName: Yup.string().required(t("profile.requiredFullName")),
    address: Yup.string().required(t("profile.requiredAddress")),
    email: Yup.string()
      .email(t("profile.invalidEmail"))
      .required(t("profile.requiredEmail")),
    phoneNumber: Yup.string().required(t("profile.requiredPhone")),
    InstitutionTypeLookupId:
      role !== "Admin"
        ? Yup.mixed().required(t("profile.requiredInstitution"))
        : Yup.mixed().notRequired(),
  });

  const [updateProvider, { isLoading: isProviderLoading }] =
    useUpdateProviderMutation();
  const [updateRequester, { isLoading: isRequesterLoading }] =
    useUpdateRequesterMutation();
  const [updateAdmin, { isLoading: isAdminLoading }] = useUpdateAdminMutation();
  const isLoading = isProviderLoading || isRequesterLoading || isAdminLoading;

  const [selectedFiles, setSelectedFiles] = useState(null);
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const { data: addresses } = useGetCitiesQuery();
  const { data: providerData } = useGetProviderEntityTypesQuery(undefined, {
    skip: role !== "Provider",
  });
  const { data: requesterData } = useGetRequesterEntityTypesQuery(undefined, {
    skip: role !== "Requester",
  });
  const types = role === "Provider" ? providerData : requesterData;

  const [preview, setPreview] = useState(() => {
    const url = data?.profilePictureUrl;
    return url ? `${import.meta.env.VITE_APP_BASE_URL}/${url}` : null;
  });

  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null); // إشارة لعنصر الفيديو
  const canvasRef = useRef(null); // إشارة لعنصر الكانفاس

  // التعامل مع تغيير الصورة من خلال رفع ملف
  const handleImageChange = useCallback((event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue("ProfilePicture", file);
      setFieldValue("IsProfilePictureChanged", true);
      setIsChanged(true);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // تشغيل الكاميرا لالتقاط صورة
  const openCamera = useCallback(async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      toast.error(
        t("profile.cameraAccessFailed") || "فشل الوصول إلى الكاميرا"
      );
    }
  }, []);

  // التقاط الصورة من الكاميرا
  const captureImage = useCallback((setFieldValue) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-image.png", {
              type: "image/png",
              lastModified: Date.now(),
            });
            setPreview(URL.createObjectURL(file)); // عرض المعاينة
            setFieldValue("ProfilePicture", file); // تحديث قيمة الصورة في Formik
            setFieldValue("IsProfilePictureChanged", true); // تحديث قيمة الصورة في Formik
            setIsChanged(true);
          }
        }, "image/png");
        stopCamera(); // إيقاف الكاميرا بعد التقاط الصورة
      }
    }
  }, []);

  // إيقاف الكاميرا وتنظيف الستريم
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, []);

  // دالة لإغلاق النافذة وتنظيف حالة المعاينة والكاميرا
  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedFiles([]);
    setPreview(null);
    stopCamera();
  }, [setOpen, stopCamera]);
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[5000]">
      <DialogBackdrop
        transition
        className="fixed inset-0  bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto rounded-lg">
        <div className="flex md:h-full justify-center items-center p-4 text-center sm:items-center sm:p-0 rounded-lg">
          <DialogPanel className="relative sm:min-w-[450px] max-h-[70vh]  transform overflow-auto rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
            <Formik
              initialValues={{
                FullName: data?.fullName || data?.name || "",
                email: data?.email || "",
                phoneNumber: data?.phoneNumber || "",
                CommercialRegistrationNumber:
                  data?.commercialRegistrationNumber || "",
                CommercialRegistrationDate:
                  data?.commercialRegistrationDate?.split("T")[0] || "",
                address: data?.city?.id || data?.address || "",
                InstitutionTypeLookupId: data?.entityType?.id || "",
                ProfilePicture: null,
                IsProfilePictureChanged: false,
                ProfilePictureUrl: `${data?.profilePictureUrl}`,
                AttachmentsGroupKey: data?.attachmentsGroupKey || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  let updateFn;
                  if (role === "Provider") updateFn = updateProvider;
                  else if (role === "Requester") updateFn = updateRequester;
                  else if (role === "Admin") updateFn = updateAdmin;

                  if (!updateFn) {
                    toast.error(t("profile.unknownUserRole"));
                    return;
                  }

                  // 🟢 تجهيز GroupKey
                  const groupKey = values.AttachmentsGroupKey || null;
                  // 🟡 رفع الملفات (لو فيه ملفات مرفوعة)
                  if (selectedFiles && selectedFiles.length > 0) {
                    const uploadFormData = new FormData();
                    uploadFormData.append(
                      "attachmentUploaderLookupId",
                      role === "Requester" ? 702 : role === "Admin" ? 700 : 701
                    );

                    for (let i = 0; i < selectedFiles.length; i++) {
                      uploadFormData.append("files", selectedFiles[i]);
                    }

                    const uploadRes = await axios.post(
                      `${import.meta.env.VITE_APP_BASE_URL}api/attachments${
                        groupKey ? `?groupKey=${groupKey}` : ""
                      }`,
                      uploadFormData
                    );

                    const newGroupKey = uploadRes?.data?.groupKey;

                    // 🟢 تخزين GroupKey المحدث
                    values.AttachmentsGroupKey = newGroupKey;
                  }

                  // 🟢 تجهيز الفورم داتا للتحديث
                  const formData = new FormData();
                  for (const key in values) {
                    if (values[key]) {
                      formData.append(key, values[key]);
                    }
                  }
                  formData.append("IsProfilePictureChanged", isChanges);
                  // 🟢 استدعاء تحديث البيانات
                  await updateFn(formData).unwrap();
                  toast.success(t("profile.profileUpdateSuccess"));
                  setOpen(false);
                } catch (error) {
                  toast.error(
                    error?.data?.Message || t("profile.profileUpdateFailed") || "حدث خطأ أثناء تحديث الملف الشخصي"
                  );
                } finally {
                  setSubmitting(false);
                  refetch();
                }
              }}
              enableReinitialize
            >
              {({ setFieldValue, values, errors, touched }) => (
                <Form className="bg-white pb-4 pt-5 px-4">
                  <div className="mt-3 text-center sm:mt-0 flex flex-col gap-3 justify-center items-center">
                    <div className="w-full flex items-center justify-between gap-4">
                      {/* عرض الصورة أو الكاميرا */}
                      {!cameraOpen ? (
                        <div className="relative w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center bg-gray-100">
                          {preview ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {t("profile.cameraPreview")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <video
                            ref={videoRef}
                            className="w-64 h-48 bg-black"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <button
                            type="button"
                            className="inline-flex flex-1 justify-center rounded-lg bg-[#F5D446] py-2 px-3 text-sm font-semibold text-black shadow-sm hover:bg-[#F5D446bc] sm:ml-3 sm:w-auto"
                            onClick={() => captureImage(setFieldValue)}
                          >
                            {t("profile.captureImage")}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          className="flex items-center justify-center w-20 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                          onClick={openCamera}
                        >
                          <img src={camIcon} alt="camera" />
                        </button>
                        <label className="flex items-center justify-center w-20 h-8 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(e, setFieldValue)
                            }
                            className="hidden"
                          />
                          <img src={fileIcon} alt="upload" />
                        </label>
                      </div>
                    </div>
                    {/* {errors.image && touched.image && (
                      <div className="text-red-500 text-xs">{errors.image}</div>
                    )} */}

                    {/* حقل الاسم */}
                    <div className="w-full">
                      <label
                        htmlFor="name"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.fullName")}
                      </label>
                      <Field
                        id="FullName"
                        name="FullName"
                        type="text"
                        placeholder={t("profile.fullName")}
                        className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm focus:outline-none focus:ring-[#F5D446] focus:border-[#F5D446] text-xs"
                      />
                      {errors.FullName && touched.FullName && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.FullName}
                        </div>
                      )}
                    </div>

                    {/* حقل البريد الإلكتروني */}
                    <div className="w-full">
                      <label
                        htmlFor="email"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.email")}
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("profile.email")}
                        className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm focus:outline-none focus:ring-[#F5D446] focus:border-[#F5D446] text-xs"
                      />
                      {errors.email && touched.email && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* حقل رقم الجوال */}
                    <div className="w-full">
                      <label
                        htmlFor="phone"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.phone")}
                      </label>
                      <div className="relative" style={{ direction: "ltr" }}>
                        <PhoneInput
                          id="phone"
                          name="phone"
                          value={values.phoneNumber}
                          country={"sa"} // الدولة الافتراضية (السعودية)
                          onChange={(value) => setFieldValue("phone", value)}
                          inputClass="!w-full !h-[42px] border border-[#E8E8E8] rounded-lg shadow-sm px-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D446] focus:border-[#F5D446] bg-white"
                          containerClass="relative w-full"
                          dropdownClass="text-sm bg-white shadow-md border border-gray-200 rounded-lg"
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    <div className="w-full">
                      <label
                        htmlFor="CommercialRegistrationNumber"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.crNumber")}
                      </label>
                      <Field
                        id="CommercialRegistrationNumber"
                        name="CommercialRegistrationNumber"
                        type="text"
                        placeholder={t("profile.crNumber")}
                        className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm text-xs"
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="CommercialRegistrationDate"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.crDate")}
                      </label>
                      <Field
                        id="CommercialRegistrationDate"
                        name="CommercialRegistrationDate"
                        type="date"
                        className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm text-xs"
                      />
                    </div>

                    {/* حقل العنوان */}
                    <div className="w-full">
                      <label
                        htmlFor="address"
                        className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                      >
                        {t("profile.address")}
                      </label>
                      <Field
                        as="select"
                        id="address"
                        name="address"
                        className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm text-xs"
                      >
                        <option value="">{t("profile.selectCity")}</option>
                        {addresses?.map((city) => (
                          <option key={city.id} value={city.id}>
                            {lang === "ar" ? city.nameAr : city.nameEn}
                          </option>
                        ))}
                      </Field>
                    </div>
                    {role !== "Admin" && (
                      <div className="w-full">
                        <label
                          htmlFor="InstitutionTypeLookupId"
                          className="text-[13px] font-normal text-gray-700 block mb-1 text-right"
                        >
                          {t("profile.institutionType")}
                        </label>
                        <Field
                          as="select"
                          id="InstitutionTypeLookupId"
                          name="InstitutionTypeLookupId"
                          className="block w-full px-3 py-3 border border-[#E8E8E8] rounded-lg shadow-sm text-xs"
                        >
                          <option value="">{t("profile.selectType")}</option>
                          {types?.map((type) => (
                            <option key={type.id} value={type.id}>
                              {lang === "ar" ? type.nameAr : type.nameEn}
                            </option>
                          ))}
                        </Field>
                        {errors.InstitutionTypeLookupId &&
                          touched.InstitutionTypeLookupId && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors.InstitutionTypeLookupId}
                            </div>
                          )}
                      </div>
                    )}

                    <Field
                      type="hidden"
                      name="AttachmentsGroupKey"
                      value={values.AttachmentsGroupKey}
                    />
                  </div>
                  <div className="flex flex-col gap-4 mt-3">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
                    >
                      <img src={fileUpload} alt="" />
                      <span className="text-sm font-normal">
                        {t("profile.attachments")}
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
                  {/* أزرار التأكيد والعودة */}
                  <div className="bg-gray-50 py-3 flex flex-row justify-center items-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`inline-flex flex-1 justify-center rounded-lg bg-primary py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 sm:ml-3 sm:w-auto
    ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {isLoading ? (
                        <span className="loader border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                      ) : (
                        t("profile.confirm")
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex flex-1 border-none outline-none justify-center rounded-lg bg-[#F3F6F5] py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      {t("profile.cancel")}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
