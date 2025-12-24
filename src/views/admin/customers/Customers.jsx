import HeadTitle from "@/components/shared/head-title/HeadTitle";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomersTable from "../../../components/admin-components/customers/CustomersTable";

const Partners = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("customers.title")}</title>
      <meta name="description" content={t("customers.description")} />
      <HeadTitle
        title={t("customers.titlePage")}
        // description={t("partners.description")}
      />
      <CustomersTable />
    </div>
  );
};

export default Partners;
