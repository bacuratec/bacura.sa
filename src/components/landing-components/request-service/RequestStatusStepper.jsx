import React from "react";

export default function RequestStatusStepper({ status }) {
  const currentCode = status?.code || "";
  const steps = [
    { code: "pending", labelAr: "قيد المراجعة" },
    { code: "priced", labelAr: "تم التسعير" },
    { code: "waiting_payment", labelAr: "بانتظار الدفع" },
    { code: "paid", labelAr: "تم الدفع" },
    { code: "provider_assigned", labelAr: "تم تعيين مزود" },
    { code: "pending_delivery", labelAr: "بانتظار التسليم" },
    { code: "under_review", labelAr: "تحت المراجعة" },
    { code: "completed", labelAr: "مكتمل" },
  ];
  const currentIndex = Math.max(
    steps.findIndex((s) => s.code === currentCode),
    0
  );

  return (
    <div className="flex items-center justify-between relative my-4">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded transition-all duration-300"
        style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
      />
      {steps.map((step, idx) => {
        const active = idx <= currentIndex;
        return (
          <div key={step.code} className="flex flex-col items-center gap-2 bg-white px-2">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-primary border-primary text-white" : "bg-white border-primary text-primary"
                }`}
            >
              {active ? <span>✓</span> : <span>{idx + 1}</span>}
            </div>
            <span className="text-[10px] md:text-sm font-medium text-center">
              {status?.name_ar || status?.nameAr || step.labelAr}
            </span>
          </div>
        );
      })}
    </div>
  );
}
