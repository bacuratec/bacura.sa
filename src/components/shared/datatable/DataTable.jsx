// components/shared/DataTable.jsx
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import searchIcon from "../../../assets/icons/searchIcon.svg";
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  ...rest
}) => {
  const { t } = useTranslation();
  const path = useLocation();

  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: tabs?.length > 0 ? "0 0 12px 12px" : "12px", // أو أي قيمة تحبها
        overflow: "hidden", // مهم جدًا عشان المحتوى ما يطلعش بره
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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // تصفية البيانات حسب كلمات البحث في الحقول المحددة
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      searchableFields.some((field) =>
        String(row[field]).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchableFields]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("PageNumber", page);
    navigate(`${location.pathname}?${params.toString()}`);
  };
  const handlePerRowsChange = (newPageSize, page) => {
    const params = new URLSearchParams(location.search);
    params.set("PageSize", newPageSize);
    params.set("PageNumber", page);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const [searchParams] = useSearchParams();
  const AccountStatus =
    searchParams.get("AccountStatus") ||
    searchParams.get("RequestStatus") ||
    searchParams.get("OrderStatusLookupId") ||
    "";
  const PageSize = searchParams.get("PageSize") || 30;

  return (
    <div className="custom-table">
      {title && <h2 className="mb-4 font-medium text-sm">{title}</h2>}
      {searchableFields && (
        <div className="relative mb-4 flex justify-center">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 pl-10 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
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
                <NavLink
                  to={item?.href}
                  className={() => {
                    const isActive =
                      item?.href.includes(AccountStatus) && AccountStatus;

                    const isAll =
                      item?.name === "الكل" ||
                      item?.name.toLowerCase() === "all";

                    let textColor = "text-[#898A8D]";

                    if ((isActive && !isAll) || (isAll && !AccountStatus)) {
                      textColor = "text-black";
                    }
                    return `flex items-center gap-2 ${textColor}`;
                  }}
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
                </NavLink>
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
        paginationServer // 👈 مهم جدًا: عشان البيانات server-side
        paginationTotalRows={totalRows} // 👈 اجمالي عدد العناصر
        paginationDefaultPage={parseInt(defaultPage)} // 👈 رقم الصفحة من props
        paginationPerPage={parseInt(defaultPageSize)} // 👈 حجم الصفحة من props
        onChangePage={
          path?.pathname.includes("/projects/") ? () => {} : handlePageChange
        } // 👈 تغيير الصفحة
        onChangeRowsPerPage={
          path?.pathname.includes("/projects/") ? () => {} : handlePerRowsChange
        } // 👈 تغيير حجم الصفحة
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
