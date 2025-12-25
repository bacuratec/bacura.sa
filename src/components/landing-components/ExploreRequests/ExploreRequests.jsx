// example: pages/OrdersTable.jsx

import { Link, useSearchParams } from "react-router-dom";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetUserOrdersQuery } from "../../../redux/api/ordersApi";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";

const ExploreRequests = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const [searchParams] = useSearchParams();
  // استخراج القيم من الـ URL
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const RequestStatus = searchParams.get("RequestStatus") || "";

  const {
    data: orders,
    isLoading,
    refetch,
  } = useGetUserOrdersQuery({
    PageNumber,
    PageSize,
    RequestStatus,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, RequestStatus]);

  const tabs = [
    {
      name: t("requestsUser.status_all"),
      href: "",
      numbers: stats?.totalRequestsCount,
      color: "#637381",
    },
    {
      name: t("requestsUser.status_new"),
      href: "?RequestStatus=505",
      numbers: stats?.newRequestssCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_processing"),
      href: "?RequestStatus=500",
      numbers: stats?.underProcessingRequestsCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_initial_approval"),
      href: "?RequestStatus=501",
      numbers: stats?.initiallyApprovedRequestsCount,

      color: "#007867",
    },
    {
      name: t("requestsUser.status_waiting_payment"),
      href: "?RequestStatus=502",
      numbers: stats?.waitingForPaymentRequestsCount,
      color: "#b76f21",
    },
    {
      name: t("requestsUser.status_rejected"),
      href: "?RequestStatus=503",
      numbers: stats?.rejectedRequestsCount,
      color: "#B71D18",
    },
    {
      name: t("requestsUser.status_completed"),
      href: "?RequestStatus=504",
      numbers: stats?.approvedRequestsCount,
      color: "#007867",
    },
  ];
  const columns = [
    {
      name: t("requestsUser.request_number"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row?.requestNumber}
        </span>
      ),
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row.services[0].titleAr : row.services[0].titleEn,
      wrap: true,
    },
    {
      name: t("requestsUser.requester_name"),
      selector: (row) => row.fullName,
      wrap: true,
    },
    {
      name: t("requestsUser.request_date"),
      selector: (row) => dayjs(row.creationTime).format("DD/MM/YYYY hh:mm A"),
      wrap: true,
    },
    {
      name: t("requestsUser.request_status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                row.requestStatus?.id === 504
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.requestStatus?.id === 501
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-[#007867]"
                  : row.requestStatus?.id === 503
                  ? "bg-red-100 text-red-700"
                  : row.requestStatus?.id === 502
                  ? "bg-red-100 text-[#B76E00]"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {lang === "ar"
            ? row.requestStatus?.nameAr
            : row.requestStatus?.nameEn}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("requestsUser.action"),
      cell: (row) => (
        <Link
          href={`/requests/${row.id}`}
          className="bg-[#1A71F6] text-white px-1 py-1 rounded-xl hover:bg-blue-700 transition text-xs font-medium ml-5 text-nowrap"
        >
          <Eye />
        </Link>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];
  const sortedData = orders
    ? [...orders]?.sort((a, b) => {
        // لو رقم الطلب عبارة عن أرقام
        return Number(b?.requestNumber) - Number(a?.requestNumber); // تنازلي
        // return Number(a.requestNumber) - Number(b.requestNumber); // تصاعدي
      })
    : [];
  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white xl:p-6">
          <h3 className="font-bold text-xl mb-3">
            {t("requestsUser.my_requests")}
          </h3>
          <CustomDataTable
            tabs={tabs}
            columns={columns}
            data={sortedData}
            searchableFields={["fullName", "email", "requestNumber"]}
            searchPlaceholder={t("searchPlaceholder")}
            defaultPage={PageNumber}
            defaultPageSize={PageSize}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ExploreRequests;
