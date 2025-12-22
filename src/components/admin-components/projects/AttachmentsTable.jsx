import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CustomDataTable from "../../shared/datatable/DataTable";

const AttachmentsTable = ({ title, attachments }) => {
  const { t } = useTranslation();
  const base = import.meta.env.VITE_APP_BASE_URL;

  const columns = [
    {
      name: t("projects.attachments"),
      cell: (row) => (
        <span className="rounded-lg text-xs text-blue-600 font-normal">
          {row?.fileName}
        </span>
      ),
    },
    {
      name: t("projects.action"),
      cell: (row) => (
        <a
          href={`${base}${row?.filePathUrl}`}
          target="_blank"
          className="text-[#1A71F6] text-xs font-bold ml-5 text-nowrap"
        >
          {t("projects.preview")}
        </a>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="py-2">
      <div className="rounded-3xl bg-white p-3">
        <CustomDataTable
          title={title || t("projects.attachments")}
          columns={columns}
          data={attachments}
          searchableFields={false}
        />
      </div>
    </div>
  );
};

export default AttachmentsTable;
