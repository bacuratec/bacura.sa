"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";

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
                        {orders.map((order) => (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium text-gray-900">
                                    {order.request?.service?.[isRtl ? "name_ar" : "name_en"] || order.request?.title}
                                </td>
                                <td className="px-4 py-4 text-gray-500">
                                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: isRtl ? arSA : enUS })}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {order.status?.[isRtl ? "name_ar" : "name_en"] || "Unknown"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentRequests;
