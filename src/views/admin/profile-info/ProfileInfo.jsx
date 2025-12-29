import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import {
  useCreateProfileInfoMutation,
  useGetProfileInfoQuery,
} from "../../../redux/api/profileInfoApi";
import pdfIcon from "@/assets/images/pdf.png";
import fileUploadImg from "@/assets/icons/fileUpload.svg";
import toast from "react-hot-toast";
import { getAppBaseUrl } from "../../../utils/env";

const base = getAppBaseUrl();

// Card for already-uploaded attachments (your original style)
export const AttachmentCard = ({ item }) => {
  return (
    <a
      href={`${base}${item?.filePathUrl}`}
      target="_blank"
      rel="noreferrer"
      key={item?.id}
      className="attachCard max-w-52 xl:h-44 lg:h-36 md:h-32 sm:h-28 h-24 bg-gray-300/30 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col gap-3 items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all duration-500 hover:shadow-xl"
    >
      {item?.attachmentExtension === ".pdf" ? (
        <img
          src={pdfIcon}
          alt="pdf"
          className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain"
        />
      ) : (
        <img
          src={`${base}${item?.filePathUrl}`}
          alt={item?.fileName || "attachment"}
          className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain"
        />
      )}
      <h4 className="text-[10px] md:text-xs text-center">
        {(() => {
          const fullName = item?.fileName || "";
          const lastDotIndex = fullName.lastIndexOf(".");
          const name =
            lastDotIndex !== -1 ? fullName.slice(0, lastDotIndex) : fullName;
          const ext = lastDotIndex !== -1 ? fullName.slice(lastDotIndex) : "";

          return name.slice(0, 8) + ext;
        })()}
      </h4>
    </a>
  );
};

const SelectedAttachmentCard = ({ file, onRemove }) => {
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const previewUrl = isPdf ? null : URL.createObjectURL(file);

  // We rely on the parent to revoke object URLs when removing / unmounting
  return (
    <div className="relative w-36 h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2 shadow">
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-600"
        aria-label="remove"
      >
        ✕
      </button>

      {isPdf ? (
        <img src={typeof pdfIcon === "string" ? pdfIcon : (pdfIcon?.src || "")} alt="pdf" className="w-12 h-12 object-contain" loading="lazy" decoding="async" />
      ) : (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <h4 className="mt-1 text-[11px] text-center truncate w-full">
        {(() => {
          const fullName = file.name || "";
          const lastDotIndex = fullName.lastIndexOf(".");
          const name =
            lastDotIndex !== -1 ? fullName.slice(0, lastDotIndex) : fullName;
          const ext = lastDotIndex !== -1 ? fullName.slice(lastDotIndex) : "";

          return name.slice(0, 8) + ext;
        })()}
      </h4>
    </div>
  );
};

const ProfileInfo = () => {
  const { t } = useTranslation();
  const { data } = useGetProfileInfoQuery(); // existing uploaded attachments (if any)
  const [createProfileInfo, { isLoading: uploading }] =
    useCreateProfileInfoMutation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // لو في File URL قديم نحذفه
    if (preview?.url) URL.revokeObjectURL(preview.url);

    const newPreview = {
      file,
      url: file.type === "application/pdf" ? null : URL.createObjectURL(file),
    };

    setSelectedFile(file);
    setPreview(newPreview);

    e.target.value = null; // علشان لو اختار نفس الملف تاني
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please attach a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await createProfileInfo(formData).unwrap();
      toast.success("Uploaded successfully");

      if (preview?.url) URL.revokeObjectURL(preview.url);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div>
      <title>{t("footer.profile")}</title>
      <meta name="description" content={t("footer.profile")} />

      <HeadTitle title={t("footer.profile")} />
      <div className="container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4">
            <label className="font-medium text-sm">
              {t("footer.profile")} <span className="text-red-500">*</span>
            </label>

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
            >
              <img src={typeof fileUploadImg === "string" ? fileUploadImg : (fileUploadImg?.src || "")} alt="upload" className="mb-2 w-20" loading="lazy" decoding="async" />
              <span className="text-sm font-normal">
                {t("formRequest.attachmentsPlaceholder")}
              </span>
              <input
                id="file-upload"
                name="attachment"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* preview selected files with X */}
          {selectedFile && (
            <SelectedAttachmentCard
              file={selectedFile}
              onRemove={() => {
                if (preview?.url) URL.revokeObjectURL(preview.url);
                setSelectedFile(null);
                setPreview(null);
              }}
            />
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            >
              {uploading
                ? t("profileInfo.uploading") || "Uploading..."
                : t("profileInfo.submit") || "Submit"}
            </button>
          </div>
        </form>

        {/* show already-uploaded attachments from server */}
        {data && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AttachmentCard item={data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
