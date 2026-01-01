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
import { Camera, Upload, User, Mail, Phone, Calendar as CalendarIcon, MapPin, Building, FileText } from "lucide-react";

import {
  useUpdateAdminMutation,
  useUpdateProviderMutation,
  useUpdateRequesterMutation,
  useUpdateUserContactMutation,
} from "../../../redux/api/updateApi";
import {
  useGetProviderEntityTypesQuery,
  useGetRequesterEntityTypesQuery,
} from "../../../redux/api/typeApi";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";

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
  const [updateUserContact] = useUpdateUserContactMutation();
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
    return url ? `${getAppBaseUrl()}/${url}` : null;
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
    } catch {
      toast.error(
        t("profile.cameraAccessFailed") || "فشل الوصول إلى الكاميرا"
      );
    }
  }, [t]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel className="relative w-full max-w-2xl transform overflow-hidden rounded-[32px] bg-white text-left shadow-2xl transition-all animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between relative z-10">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                {t("profile.editTitle") || "تعديل الملف الشخصي"}
              </h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>
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
                      `${getAppBaseUrl()}api/attachments${groupKey ? `?groupKey=${groupKey}` : ""
                      }`,
                      uploadFormData
                    );

                    const newGroupKey = uploadRes?.data?.groupKey;

                    // 🟢 تخزين GroupKey المحدث
                    values.AttachmentsGroupKey = newGroupKey;
                  }

                  // 🟢 تجهيز الحمولة للتحديث وفق الدور
                  let payload = {};
                  if (role === "Requester") {
                    payload = {
                      requesterId: data?.id,
                      name: values.FullName || values.name || "",
                      commercialRegNo: values.CommercialRegistrationNumber || null,
                      cityId: values.address || null,
                    };
                  } else if (role === "Provider") {
                    payload = {
                      providerId: data?.id,
                      name: values.FullName || values.name || "",
                      cityId: values.address || null,
                    };
                  } else if (role === "Admin") {
                    payload = {
                      adminId: data?.id,
                      displayName: values.FullName || values.name || "",
                    };
                  }
                  await updateFn(payload).unwrap();
                  // تحديث بيانات التواصل للمستخدم (البريد/الهاتف)
                  const userId = data?.user?.id || data?.userId || null;
                  if (userId) {
                    await updateUserContact({
                      userId,
                      email: values.email,
                      phone: values.phoneNumber,
                    }).unwrap();
                  }
                  toast.success(t("profile.profileUpdateSuccess"));
                  setOpen(false);
                } catch {
                  toast.error(
                    t("profile.profileUpdateFailed") || "حدث خطأ أثناء تحديث الملف الشخصي"
                  );
                } finally {
                  setSubmitting(false);
                  refetch();
                }
              }}
              enableReinitialize
            >
              {({ setFieldValue, values, errors, touched }) => (
                <Form className="bg-white p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture Section */}
                    <div className="md:col-span-2 flex items-center gap-6 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 mb-4">
                      {!cameraOpen ? (
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white">
                            {preview ? (
                              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <User className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                          <video ref={videoRef} className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          <button
                            type="button"
                            className="absolute bottom-4 left-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg"
                            onClick={() => captureImage(setFieldValue)}
                          >
                            {t("profile.captureImage")}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-gray-800 text-sm">{t("profile.profilePicture") || "الصورة الشخصية"}</h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-gray-600 hover:text-primary"
                            onClick={openCamera}
                            title={t("profile.openCamera")}
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          <label className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-gray-600 hover:text-primary cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFieldValue)} className="hidden" />
                            <Upload className="w-5 h-5" />
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{t("profile.fullName")}</label>
                      <Field
                        name="FullName"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-gray-800"
                        placeholder={t("profile.fullName")}
                      />
                      <ErrorMessage name="FullName" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{t("profile.email")}</label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-gray-800"
                        placeholder={t("profile.email")}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5" style={{ direction: "ltr" }}>
                      <label className="text-sm font-bold text-gray-700 block text-right">{t("profile.phone")}</label>
                      <PhoneInput
                        country={"sa"}
                        value={values.phoneNumber}
                        onChange={(val) => setFieldValue("phoneNumber", val)}
                        inputStyle={{
                          width: '100%',
                          height: '52px',
                          borderRadius: '1rem',
                          backgroundColor: '#f9fafb',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                        containerStyle={{
                          width: '100%',
                        }}
                      />
                      <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* CR Number */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{t("profile.crNumber")}</label>
                      <Field
                        name="CommercialRegistrationNumber"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                        placeholder={t("profile.crNumber")}
                      />
                    </div>

                    {/* CR Date */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{t("profile.crDate")}</label>
                      <Field
                        name="CommercialRegistrationDate"
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                      />
                    </div>

                    {/* Address/City */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{t("profile.address")}</label>
                      <Field
                        as="select"
                        name="address"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                      >
                        <option value="">{t("profile.selectCity")}</option>
                        {addresses?.map((city) => (
                          <option key={city.id} value={city.id}>
                            {lang === "ar" ? city.nameAr : city.nameEn}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* Institution Type */}
                    {role !== "Admin" && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">{t("profile.institutionType")}</label>
                        <Field
                          as="select"
                          name="InstitutionTypeLookupId"
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                        >
                          <option value="">{t("profile.selectType")}</option>
                          {types?.map((type) => (
                            <option key={type.id} value={type.id}>
                              {lang === "ar" ? type.nameAr : type.nameEn}
                            </option>
                          ))}
                        </Field>
                      </div>
                    )}

                    <Field
                      type="hidden"
                      name="AttachmentsGroupKey"
                    />
                  </div>
                  {/* Attachments Section */}
                  <div className="md:col-span-2 mt-4">
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{t("profile.attachments")}</label>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[24px] px-6 py-10 cursor-pointer text-center hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                      </div>
                      <span className="text-sm font-bold text-gray-500 group-hover:text-primary">
                        {t("profile.attachments")}
                      </span>
                      <input id="file-upload" type="file" onChange={handleFileChange} multiple className="hidden" />
                    </label>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                        {Array.from(selectedFiles).map((file, index) => (
                          <span key={index} className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      {t("profile.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-12 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        t("profile.confirm")
                      )}
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
