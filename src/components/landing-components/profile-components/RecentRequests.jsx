"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/locale/en";

const RecentRequests = ({ orders }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4">{t("profile.recentActivity")}</h3>
                <p className="text-gray-500 text-sm">{t("profile.noRecentActivity")}</p>
                <Link href="/request-service" className="text-primary text-sm font-medium mt-2 inline-block">
                    {t("profile.startNewRequest")}
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{t("profile.recentActivity")}</h3>
                <Link href="/requests" className="text-primary text-sm font-medium hover:underline">
                    {t("common.viewAll")}
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                        <tr>
                            <th className="px-4 py-3 rounded-s-lg">{t("common.service")}</th>
                            <th className="px-4 py-3">{t("common.date")}</th>
                            <th className="px-4 py-3 rounded-e-lg">{t("common.status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((item) => {
                            const service =
                                item.request?.service ||
                                item.service ||
                                null;
                            const serviceName =
                                service?.[isRtl ? "name_ar" : "name_en"] ||
                                item.request?.title ||
                                item.title ||
                                "-";
                            const statusObj = item.status || item.request?.status || null;
                            const statusName =
                                statusObj?.[isRtl ? "name_ar" : "name_en"] || t("common.status");
                            const createdAt = item.created_at || item.request?.created_at;
                            return (
                                <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-800">{serviceName}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5">#{item.id?.substring(0, 8)}</div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                                        {createdAt ? dayjs(createdAt).locale(isRtl ? "ar" : "en").format("DD MMM YYYY") : "-"}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all
                                        ${statusObj?.code === 'approved' || statusObj?.code === 'completed'
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : statusObj?.code === 'under_processing' || statusObj?.code === 'initially_approved'
                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                    : statusObj?.code === 'rejected'
                                                        ? "border-red-200 bg-red-50 text-red-700"
                                                        : "border-gray-200 bg-gray-50 text-gray-600"
                                            }`}>
                                            {statusName}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentRequests;
