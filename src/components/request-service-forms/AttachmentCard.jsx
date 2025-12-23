import React from "react";
import pdf from "@/assets/images/pdf.png";
import { supabase } from "@/lib/supabaseClient";

const getPublicUrl = (path) => {
  if (!path) return "#";
  const { data } = supabase.storage.from("attachments").getPublicUrl(path);
  return data?.publicUrl || "#";
};

const AttachmentCard = ({ item }) => {
  const isPdf = item?.attachmentExtension === ".pdf";
  const filePath = item?.filePathUrl; // يفترض أن يكون مسار الملف داخل bucket Supabase
  const publicUrl = getPublicUrl(filePath);

  return (
    <div>
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        key={item?.id}
        className="attachCard max-w-52 xl:h-44 lg:h-36 md:h-32 sm:h-28 h-24 bg-gray-300/30 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col gap-3 items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all duration-500 hover:shadow-xl"
      >
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
    </div>
  );
};

export default AttachmentCard;
