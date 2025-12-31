import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RequestsTable from "@/components/admin-components/requests/RequestsTable";
import { useTranslation } from "react-i18next";
import { adminStatisticsService } from "@/services/api";

const Requestes = () => {
    const { t } = useTranslation();
    const [requestsStats, setRequestsStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchStats = async () => {
            try {
                const { data } = await adminStatisticsService.getRequestsStatistics();
                if (data) {
                    setRequestsStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch request statistics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <title>{t("requests.title")}</title>
            <meta name="description" content={t("requests.description")} />
            <HeadTitle
                title={t("requests.title")}
            // description={t("requests.description")}
            />
            {!isLoading && (!requestsStats || (requestsStats?.totalRequestsCount ?? 0) === 0) && (
                <div className="w-full py-4 text-center text-sm text-gray-600">
                    {t("requests.empty") || "لا توجد بيانات للعرض"}
                </div>
            )}
            <RequestsTable stats={requestsStats} />
        </div>
    );
};

export default Requestes;
