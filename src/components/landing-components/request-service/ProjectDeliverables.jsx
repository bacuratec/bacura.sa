"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useGetDeliverablesQuery, useUpdateDeliverableStatusMutation } from "@/redux/api/ordersApi";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

const ProjectDeliverables = ({ orderId, isProvider = false }) => {
    const { t } = useTranslation();
    const { data: deliverables = [], isLoading, refetch } = useGetDeliverablesQuery({ orderId }, {
        skip: !orderId,
        pollingInterval: 10000
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateDeliverableStatusMutation();

    const handleStatusUpdate = async (deliverableId, status, responseText) => {
        try {
            await updateStatus({
                deliverableId,
                status,
                requesterResponse: responseText // optional reason/note
            }).unwrap();
            toast.success(status === 'accepted' ? t("deliverables.accepted") : t("deliverables.rejected"));
            refetch();
        } catch {
            toast.error(t("common.error"));
        }
    };

    if (!orderId) return null;

    if (isLoading) return <div className="p-8 text-center text-gray-400 animate-pulse">{t("common.loading")}...</div>;

    if (deliverables.length === 0) {
        return (
            <div className="bg-gray-50/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 mt-8">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{t("deliverables.empty") || "لا توجد تسليمات حتى الآن"}</p>
                <p className="text-xs text-gray-400 mt-1">{t("deliverables.emptySub") || "سيقوم مزود الخدمة برفع الملفات هنا قريباً"}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-custom mt-8 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-gray-50/50 to-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        {t("deliverables.title") || "تسليمات وتطورات المشروع"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 ml-11 rtl:mr-11">{t("deliverables.subtitle") || "تابع تقدم العمل وحمل الملفات المسلمة"}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{t("common.total") || "الإجمالي"}</span>
                    <span className="text-xl font-black text-primary">
                        {deliverables.length}
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {deliverables.map((item, index) => (
                    <div key={item.id} className="p-8 transition-all hover:bg-gray-50/30 group">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                        {index + 1}
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-xl">{item.title}</h4>
                                    <StatusBadge status={item.status} t={t} />
                                </div>
                                {item.description && (
                                    <div className="bg-gray-50/50 rounded-2xl p-4 text-gray-600 leading-relaxed border border-gray-100/50 mb-4 max-w-3xl">
                                        {item.description}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 mt-6">
                                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{t("common.date") || "التاريخ"}</span>
                                            <span className="font-bold">{dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</span>
                                        </div>
                                    </div>

                                    {item.delivery_file_url && (
                                        <a
                                            href={item.delivery_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 text-primary px-4 py-2 rounded-xl font-black transition-all transform hover:-translate-y-0.5"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t("common.downloadFile") || "تحميل الملف المرفق"}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-stretch md:items-end gap-3 min-w-[200px] w-full md:w-auto">
                                {/* Actions for Requester Only */}
                                {!isProvider && (item.status === 'pending' || item.status === 'under_review') && (
                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => handleStatusUpdate(item.id, 'accepted')}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            {t("common.accept") || "قبول الإنجاز"}
                                        </button>
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => {
                                                const reason = window.prompt(t("deliverables.rejectReason") || "سبب الرفض؟");
                                                if (reason !== null) {
                                                    handleStatusUpdate(item.id, 'rejected', reason);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition border-2 border-rose-50 active:scale-95"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            {t("common.revisions") || "طلب تعديلات"}
                                        </button>
                                    </div>
                                )}

                                {item.requester_response && (
                                    <div className={`p-4 rounded-2xl text-sm w-full animate-fade-in ${item.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100 shadow-sm shadow-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`w-1.5 h-4 rounded-full ${item.status === 'rejected' ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                                            <span className="font-black uppercase text-[10px] tracking-wider">{t("common.feedback") || "ملاحظات العميل"}</span>
                                        </div>
                                        <p className="font-medium leading-relaxed italic">"{item.requester_response}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatusBadge = ({ status, t }) => {
    const styles = {
        pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
        under_review: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
        rejected: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-100",
    };

    const icons = {
        pending: <Clock className="w-3 h-3" />,
        under_review: <Clock className="w-3 h-3" />,
        accepted: <CheckCircle className="w-3 h-3" />,
        rejected: <XCircle className="w-3 h-3" />,
    };

    const labels = {
        pending: t("status.pending") || "قيد الانتظار",
        under_review: t("status.under_review") || "تحت المراجعة",
        accepted: t("status.accepted") || "مقبول",
        rejected: t("status.rejected") || "مرفوض",
    };

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ring-1 ring-inset ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
            {icons[status]}
            {labels[status] || status}
        </span>
    );
};

export default ProjectDeliverables;
