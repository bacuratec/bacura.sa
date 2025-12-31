import React, { useEffect, useState } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProviderTable from "@/components/admin-components/providers/ProvidersTable";
import { useTranslation } from "react-i18next";
import { adminStatisticsService } from "@/services/api";

const Providers = () => {
    const { t } = useTranslation();
    const [providerStats, setProviderStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchStats = async () => {
            try {
                const { data } = await adminStatisticsService.getServiceProvidersStatistics();
                if (data) {
                    setProviderStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch provider stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <title>{t("providers.pageTitle")}</title>
            <meta name="description" content={t("providers.pageDescription")} />
            <HeadTitle
                title={t("providers.pageTitle")}
            // description={t("providers.pageDescription")}
            />
            {!isLoading && (!providerStats || (providerStats?.totalAccountsCount ?? 0) === 0) && (
                <div className="w-full py-4 text-center text-sm text-gray-600">
                    {t("providers.empty") || "لا توجد بيانات للعرض"}
                </div>
            )}
            <ProviderTable stats={providerStats} />
        </div>
    );
};

export default Providers;
