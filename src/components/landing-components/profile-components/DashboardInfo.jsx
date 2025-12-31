import React from "react";

const DashboardInfo = ({ stats, title }) => {
  return (
    <div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats?.map((item, i) => (
          <div
            key={i}
            className={`p-4 md:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 rounded-xl bg-white group`}
          >
            <div className="flex flex-col gap-2">
              <h4 className="font-medium text-gray-500 text-sm">
                {item?.title}
              </h4>
              <span className="font-bold text-lg md:text-xl lg:text-2xl">
                {item?.number}
              </span>
            </div>
            {item?.ic ? item?.icon : (
              <img
                src={typeof item?.icon === "string" ? item.icon : (item?.icon?.src || "")}
                alt={item?.title || "icon"}
                loading="lazy"
                decoding="async"
                className="w-6 h-6"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardInfo;
