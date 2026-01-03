import React from "react";
import AttachmentCard from "./AttachmentCard";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FolderOpen, FileText, Receipt, File as FileIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const RequestAttachment = ({ attachments }) => {
  const role = useSelector((state) => state.auth.role);
  const { t } = useTranslation();

  const list = Array.isArray(attachments) ? attachments : [];

  const requestFiles = list.filter((item) => item.requestPhaseLookupId === 22 || item.requestPhaseLookupId === 23 || item.requestPhaseLookupId === 800) || [];
  const adminFiles = list.filter((item) => item.requestPhaseLookupId === 24 || item.requestPhaseLookupId === 801 || item.requestPhaseLookupId === 702) || [];
  const requesterPaymentFiles = list.filter((item) => item.requestPhaseLookupId === 25 || item.requestPhaseLookupId === 802) || [];

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {t("RequestAttachment.attachments")}
        </h3>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
          {list.length}
        </span>
      </div>

      <div className="flex flex-col gap-10">
        {requestFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <FileIcon className="w-4 h-4" />
              <h4 className="text-base">
                {t("RequestAttachment.serviceRequestFiles")}
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {requestFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} />
              ))}
            </div>
          </div>
        )}

        {adminFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-secondary font-bold">
              <FileText className="w-4 h-4" />
              <h4 className="text-base">
                {t(
                  role === "Admin"
                    ? "RequestAttachment.adminPricingFilesForYou"
                    : "RequestAttachment.adminPricingFilesForAdmin"
                )}
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {adminFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} />
              ))}
            </div>
          </div>
        )}

        {requesterPaymentFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <Receipt className="w-4 h-4" />
              <h4 className="text-base">
                {t(
                  role === "Admin"
                    ? "RequestAttachment.requesterReceiptForRequester"
                    : "RequestAttachment.requesterReceiptForYou"
                )}
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {requesterPaymentFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} />
              ))}
            </div>

            {/* Details table for receipts */}
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
              <h5 className="text-sm font-bold mb-2">{t("RequestAttachment.receiptDetails") || "تفاصيل الإيصال"}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="py-2">{t("RequestAttachment.file") || "الملف"}</th>
                      <th className="py-2">{t("RequestAttachment.type") || "النوع"}</th>
                      <th className="py-2">{t("RequestAttachment.size") || "الحجم"}</th>
                      <th className="py-2">{t("RequestAttachment.uploadedAt") || "تاريخ الرفع"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requesterPaymentFiles.map((it) => (
                      <tr key={it.id} className="border-t border-gray-100">
                        <td className="py-2">
                          <a href={(it.file_path || it.filePathUrl) ? (supabase.storage.from('attachments').getPublicUrl(it.file_path || it.filePathUrl).data.publicUrl) : '#'} target="_blank" rel="noreferrer" className="text-primary underline">
                            {it.file_name || it.fileName || it.fileName || ''}
                          </a>
                        </td>
                        <td className="py-2">{it.content_type || it.contentType || '-'}</td>
                        <td className="py-2">{it.size_bytes ? `${(it.size_bytes/1024).toFixed(1)} KB` : (it.sizeBytes ? `${(it.sizeBytes/1024).toFixed(1)} KB` : '-')}</td>
                        <td className="py-2">{it.created_at ? new Date(it.created_at).toLocaleString() : (it.createdAt ? new Date(it.createdAt).toLocaleString() : '-')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {list.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">{t("common.noAttachments") || "لا توجد مرفقات"}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RequestAttachment;
