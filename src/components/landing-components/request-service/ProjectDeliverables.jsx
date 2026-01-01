"use client";

import React, { useState } from "react";
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
        } catch (error) {
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-8 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t("deliverables.title") || "تسليمات المشروع"}
                </h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {deliverables.length} {t("common.items") || "ملفات"}
                </span>
            </div>

            <div className="divide-y divide-gray-50">
                {deliverables.map((item) => (
                    <div key={item.id} className="p-6 transition-colors hover:bg-gray-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                                    <StatusBadge status={item.status} t={t} />
                                </div>
                                {item.description && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>}

                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-gray-600">
                                        <Clock className="w-3.5 h-3.5" />
                                        {dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}
                                    </span>
                                    {item.delivery_file_url && (
                                        <a
                                            href={item.delivery_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-primary hover:text-primary-dark font-medium transition-colors hover:bg-primary/5 px-2 py-1 rounded"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            {t("common.downloadFile") || "تحميل الملف"}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 min-w-[180px]">
                                {/* Actions for Requester Only */}
                                {!isProvider && (item.status === 'pending' || item.status === 'under_review') && (
                                    <div className="flex items-center gap-2 w-full justify-end">
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => handleStatusUpdate(item.id, 'accepted')}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm hover:shadow"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t("common.accept") || "قبول"}
                                        </button>
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => {
                                                const reason = window.prompt(t("deliverables.rejectReason") || "سبب الرفض؟");
                                                if (reason !== null) {
                                                    handleStatusUpdate(item.id, 'rejected', reason);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition border border-red-100"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t("common.reject") || "رفض"}
                                        </button>
                                    </div>
                                )}

                                {item.requester_response && (
                                    <div className={`mt-2 p-3 rounded-lg text-xs w-full ${item.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>
                                        <span className="font-bold block mb-1">{t("common.notes") || "ملاحظاتك"}:</span>
                                        "{item.requester_response}"
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
