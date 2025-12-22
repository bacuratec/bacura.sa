import React from "react";

const DashboardInfo = ({ stats, title }) => {
  return (
    <div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats?.map((item, i) => (
          <div
            key={i}
            className="p-2 md:p-3 lg:p-4 xl:p-6 flex items-center justify-between shadow-md cursor-pointer  border border-[#DEE0E3] rounded-xl"
          >
            <div className="flex flex-col gap-2">
              <h4 className="font-medium text-sm md:text-base">
                {item?.title}
              </h4>
              <span className="font-bold text-lg md:text-xl lg:text-2xl">
                {item?.number}
              </span>
            </div>
            {item?.ic ? item?.icon : <img src={item?.icon} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardInfo;
