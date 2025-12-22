import React, { useEffect } from "react";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import OrdersTable from "../../../components/provider-components/active-orders/OrdersTable";
import { useTranslation } from "react-i18next";

const ActiveOrders = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("activeOrders.title")}</title>
      <meta name="description" content={t("activeOrders.description")} />
      <HeadTitle
        title={t("activeOrders.title")}
        // description={t("activeOrders.description")}
      />
      <OrdersTable />
    </div>
  );
};

export default ActiveOrders;
