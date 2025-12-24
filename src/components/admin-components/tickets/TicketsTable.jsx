import { Link } from "react-router-dom";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import { useSelector } from "react-redux";
import { EyeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import TicketModal from "../../landing-components/profile-components/TicketModal";

const TicketsTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const { data: tickets, isLoading, refetch } = useGetTicketsQuery();
  const role = useSelector((state) => state.auth.role);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const columns = [
    {
      name: t("tickets.username"),
      selector: (row) => row?.user?.fullName || "-",
      wrap: true,
    },
    {
      name: t("tickets.complaint_title"),
      selector: (row) => row?.title || "-",
      wrap: true,
    },
    {
      name: t("tickets.complaint_status"),
      selector: (row) => {
        lang === "ar"
          ? row?.ticketStatus?.nameAr
          : row?.ticketStatus?.nameEn || "-";
      },
      wrap: true,
    },
    {
      name: t("tickets.actions"),
      cell: (row) => (
        <Link
          to={
            role === "Admin"
              ? `/admin/tickets/${row.id}`
              : `/provider/tickets/${row.id}`
          }
          className="bg-primary text-white px-1 py-1 rounded-xl hover:bg-primary/90 transition text-xs font-medium ml-5 text-nowrap"
        >
          <EyeIcon />
        </Link>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="py-5">
      <div className="mx-2">
        <div className="rounded-3xl bg-white p-5">
          <button
            onClick={() => setOpen(true)}
            className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit block mr-auto"
          >
            {t("ticket.sendTicket")}
          </button>
          <TicketModal open={open} setOpen={setOpen} refetch={refetch} />
          <CustomDataTable
            columns={columns}
            data={tickets}
            searchableFields={["user.name", "title", "status.nameAr"]}
            searchPlaceholder={t("searchPlaceholder")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketsTable;
