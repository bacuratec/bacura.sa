// components/shared/DataTable.jsx
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import searchIcon from "../../../assets/icons/searchIcon.svg";
import Link from "next/link";
import { useLocation } from "@/utils/useLocation";
import { useNavigate } from "@/utils/useNavigate";
import { useSearchParams } from "@/utils/useSearchParams";
import { useTranslation } from "react-i18next";
import EmptyState from "../../shared/EmptyState";
import { FileQuestion } from "lucide-react";
const CustomDataTable = ({
  columns,
  pagination,
  data,
  title,
  searchPlaceholder,
  searchableFields = [],
  tabs = [],
  totalRows = 0, // 👈 عدد العناصر الكلي من السيرفر
  defaultPage = 1, // 👈 قيمة الصفحة الحالية
  defaultPageSize = 10, // 👈 قيمة عدد العناصر في كل صفحة
  isLoading,
  allowOverflow,
  ...rest
}) => {
  const { t } = useTranslation();
  const path = useLocation();

  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: tabs?.length > 0 ? "0 0 12px 12px" : "12px", // أو أي قيمة تحبها
        overflow: allowOverflow ? "visible" : "hidden", // التحكم في التدفق حسب الخاصية
        border: "1px solid #e5e7eb", // لون البوردر اختياري
      },
    },
    headCells: {
      style: {
        backgroundColor: "#E7E7E7", // لون خلفية الهيدر
        color: "#1f2937", // لون الخط
        fontWeight: "bold",
        fontSize: "14px",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    header: {
      style: {
        minHeight: "56px",
      },
    },
  };
  const searchParams = useSearchParams();
  const initialQ = (searchParams?.get && searchParams.get("q")) || "";
  const [search, setSearch] = useState(initialQ);
  const navigate = useNavigate();
  const location = useLocation();
  const isProjectDetail =
    /^\/projects\/[^/]+$/.test(path?.pathname || "") ||
    /^\/admin\/projects\/[^/]+$/.test(path?.pathname || "") ||
    /^\/provider\/projects\/[^/]+$/.test(path?.pathname || "");
  // تصفية البيانات حسب كلمات البحث في الحقول المحددة
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      searchableFields.some((field) =>
        String(row[field]).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchableFields]);

  const handleSearchChange = (value) => {
    setSearch(value);
    const params = new URLSearchParams(location?.search || "");
    if (value) {
      params.set("q", value);
      params.set("PageNumber", 1);
    } else {
      params.delete("q");
      params.set("PageNumber", 1);
    }
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location?.search || "");
    params.set("PageNumber", page);
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };
  const handlePerRowsChange = (newPageSize, _) => {
    const params = new URLSearchParams(location?.search || "");
    params.set("PageSize", newPageSize);
    params.set("PageNumber", 1);
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };

  const AccountStatus =
    searchParams?.get("AccountStatus") ||
    searchParams?.get("RequestStatus") ||
    searchParams?.get("OrderStatusLookupId") ||
    "";
  const PageSize = searchParams?.get("PageSize") || 30;

  return (
    <div className="custom-table">
      {title && <h2 className="mb-4 font-medium text-sm">{title}</h2>}
      {searchableFields && (
        <div className="relative mb-4 flex justify-center">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input input-search rounded-xl pl-10 w-full max-w-md"
          />
          <div className="relative rtl:left-10 ltr:right-10 top-2">
            <img src={searchIcon} alt="" />
          </div>
        </div>
      )}
      {tabs?.length > 0 ? (
        <div className="min-h-4 bg-[#E7E7E7]/80 w-full rounded-t-2xl py-4 px-5 overflow-auto">
          <ul className="flex items-center xl:gap-10 lg:gap-8 md:gap-6 gap-3 text-sm font-bold">
            {tabs?.map((item, i) => (
              <li key={i} className="text-xs shrink-0">
                <Link
                  href={item?.href}
                  className={`flex items-center gap-2 ${
                    (item?.href.includes(AccountStatus) && AccountStatus) ||
                    ((item?.name === "الكل" || item?.name.toLowerCase() === "all") && !AccountStatus)
                      ? "text-black"
                      : "text-[#898A8D]"
                  }`}
                >
                  <span
                    className={`py-0.5 px-1.5 rounded-lg`}
                    style={{
                      backgroundColor: `${item?.color}33`, // شفافية 20%
                      color: item?.color,
                    }}
                  >
                    {item?.numbers}
                  </span>
                  {item?.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        ""
      )}
      <DataTable
        data={filteredData}
        columns={columns}
        pagination={pagination === false ? false : true}
        highlightOnHover
        striped
        responsive
        selectableRows
        customStyles={customStyles}
        noDataComponent={
          <EmptyState 
            title={t("noData") || "لا توجد بيانات"}
            description={t("noDataDesc") || "لم يتم العثور على سجلات مطابقة"}
            icon={FileQuestion}
            className="w-full py-8"
          />
        }
        paginationServer // 👈 مهم جدًا: عشان البيانات server-side
        paginationTotalRows={totalRows} // 👈 اجمالي عدد العناصر
        paginationDefaultPage={parseInt(defaultPage)} // 👈 رقم الصفحة من props
        paginationPerPage={parseInt(defaultPageSize)} // 👈 حجم الصفحة من props
        onChangePage={isProjectDetail ? () => {} : handlePageChange} // 👈 تغيير الصفحة
        onChangeRowsPerPage={isProjectDetail ? () => {} : handlePerRowsChange} // 👈 تغيير حجم الصفحة
        progressPending={isLoading}
        progressComponent={
          <div className="py-10 text-center w-full">
            <span className="loader inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <p className="mt-2 text-sm text-gray-500">{t("loading")}</p>
          </div>
        }
        {...rest}
      />
    </div>
  );
};

export default CustomDataTable;
