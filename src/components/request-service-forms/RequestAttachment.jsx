import React from "react";
import AttachmentCard from "./AttachmentCard";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const RequestAttachment = ({ attachments }) => {
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();

  const RequestAttachment =
    attachments.filter((item) => item.requestPhaseLookupId === 800) || [];
  const RequestAdminAttachment =
    attachments.filter((item) => item.requestPhaseLookupId === 801) || [];
  const RequestRequesterAttachment =
    attachments.filter((item) => item.requestPhaseLookupId === 802) || [];

  return (
    <section className="rounded-2xl bg-white shadow-sm p-2 md:p-4 lg:p-5 xl:p-6">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("RequestAttachment.attachments")}
      </h3>
      <div className="flex flex-col gap-6">
        {RequestAttachment?.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold">
              {t("RequestAttachment.serviceRequestFiles")}
            </h4>
            <div className="attachments grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-3 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
              {RequestAttachment?.map((item) => (
                <AttachmentCard item={item} />
              ))}
            </div>
          </div>
        )}
        {RequestAdminAttachment?.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold">
              {t(
                role === "Admin"
                  ? "RequestAttachment.adminPricingFilesForYou"
                  : "RequestAttachment.adminPricingFilesForAdmin"
              )}
            </h4>
            <div className="attachments grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-3 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
              {RequestAdminAttachment?.map((item) => (
                <AttachmentCard item={item} />
              ))}
            </div>
          </div>
        )}
        {RequestRequesterAttachment?.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold">
              {t(
                role === "Admin"
                  ? "RequestAttachment.requesterReceiptForRequester"
                  : "RequestAttachment.requesterReceiptForYou"
              )}
            </h4>
            <div className="attachments grid xl:grid-cols-5 lg:grid-cols-4 grid-cols-3 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
              {RequestRequesterAttachment?.map((item) => (
                <AttachmentCard item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RequestAttachment;
