import React from "react";
import { useLocation } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const Statistics = ({ title, stats }) => {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <div className="my-5 w-full basis-full lg:basis-1/3">
      <div className="container">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-5">
          {title ?? ""}
        </h2>
        <div
          className={`grid ${
            pathname === "/admin" || pathname === "/provider"
              ? "grid-cols-1"
              : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          } gap-2 md:gap-3 lg:gap-5 xl:gap-9`}
        >
          {stats?.length > 0 &&
            stats?.map((item, i) => {
              return (
                <div
                  key={i}
                  className="card shadow-md cursor-pointer flex flex-col justify-between bg-white p-4 rounded-xl min-h-[100px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg">{item?.number}</h3>
                      <span className="text-[#737373] text-sm font-normal">
                        {item?.title}
                      </span>
                    </div>
                    {item?.ic ? item?.icon : <img src={item?.icon} />}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
