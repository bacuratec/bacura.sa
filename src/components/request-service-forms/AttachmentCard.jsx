import React from "react";
import pdf from "@/assets/images/pdf.png";
import { supabase } from "@/lib/supabaseClient";

const getPublicUrl = (path) => {
  if (!path) return "#";
  const { data } = supabase.storage.from("attachments").getPublicUrl(path);
  return data?.publicUrl || "#";
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(1)} ${units[i]}`;
};

const formatDate = (iso) => {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso || "";
  }
};

const AttachmentCard = ({ item }) => {
  const isPdf = (item?.attachment_extension || item?.attachmentExtension || "").toLowerCase() === ".pdf";
  // Support multiple naming conventions returned from various endpoints
  const filePath = item?.file_path || item?.filePathUrl || item?.file_path;
  const publicUrl = getPublicUrl(filePath);
  const fileName = item?.file_name || item?.fileName || item?.fileName || "file";
  const contentType = item?.content_type || item?.contentType || "";
  const sizeBytes = item?.size_bytes || item?.sizeBytes || null;
  const createdAt = item?.created_at || item?.createdAt || null;

  return (
    <div>
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        key={item?.id}
        className="attachCard max-w-52 xl:h-44 lg:h-36 md:h-32 sm:h-28 h-auto bg-gray-300/30 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col gap-3 items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all duration-500 hover:shadow-xl p-4"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0">
            {isPdf ? (
              <img
                src={pdf}
                alt=""
                className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain"
              />
            ) : (
              <img
                src={publicUrl}
                alt=""
                className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain rounded"
              />
            )}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold truncate">{fileName}</h4>
            <div className="text-xs text-gray-600 mt-1">
              {contentType && <span className="mr-2">{contentType}</span>}
              {sizeBytes != null && <span className="mr-2">{formatBytes(sizeBytes)}</span>}
              {createdAt && <span className="text-gray-500">{formatDate(createdAt)}</span>}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default AttachmentCard;
