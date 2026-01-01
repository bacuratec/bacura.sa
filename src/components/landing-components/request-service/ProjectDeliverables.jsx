"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetDeliverablesQuery, useUpdateDeliverableStatusMutation } from "@/redux/api/ordersApi";
import dayjs from "dayjs";
import toast from "react-hot-toast";

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

    if (isLoading) return <div className="p-4 text-center">{t("common.loading")}...</div>;

    if (deliverables.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100 mt-6">
                <p className="text-gray-500">{t("deliverables.empty") || "لا توجد تسليمات حتى الآن"}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-800">{t("deliverables.title") || "تسليمات المشروع"}</h3>
            </div>

            <div className="divide-y divide-gray-100">
                {deliverables.map((item) => (
                    <div key={item.id} className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</span>
                                    {item.delivery_file_url && (
                                        <a
                                            href={item.delivery_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            📎 {t("common.downloadFile") || "تحميل الملف"}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                <StatusBadge status={item.status} t={t} />

                                {/* Actions for Requester Only */}
                                {!isProvider && (item.status === 'pending' || item.status === 'under_review') && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => handleStatusUpdate(item.id, 'accepted')}
                                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                                        >
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
                                            className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition"
                                        >
                                            {t("common.reject") || "رفض"}
                                        </button>
                                    </div>
                                )}

                                {item.requester_response && (
                                    <p className="text-xs text-gray-500 italic mt-1 max-w-xs text-end">
                                        "{item.requester_response}"
                                    </p>
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
        pending: "bg-yellow-100 text-yellow-800",
        under_review: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    };

    const labels = {
        pending: t("status.pending") || "قيد الانتظار",
        under_review: t("status.under_review") || "تحت المراجعة",
        accepted: t("status.accepted") || "مقبول",
        rejected: t("status.rejected") || "مرفوض",
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
            {labels[status] || status}
        </span>
    );
};

export default ProjectDeliverables;
