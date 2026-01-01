import React, { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

export default function RequestStatusStepper({ status }) {
  const { lang } = useContext(LanguageContext);
  const rawCode = status?.code || "";
  const currentCode = rawCode === "accepted" ? "waiting_payment" : rawCode;

  const steps = [
    { code: "pending", labelAr: "قيد المراجعة", labelEn: "Pending" },
    { code: "priced", labelAr: "تم التسعير", labelEn: "Priced" },
    { code: "waiting_payment", labelAr: "بانتظار الدفع", labelEn: "Waiting Payment" },
    { code: "paid", labelAr: "تم الدفع", labelEn: "Paid" },
    { code: "provider_assigned", labelAr: "تم تعيين مزود", labelEn: "Provider Assigned" },
    { code: "pending_delivery", labelAr: "بانتظار التسليم", labelEn: "Waiting Delivery" },
    { code: "under_review", labelAr: "تحت المراجعة", labelEn: "Under Review" },
    { code: "completed", labelAr: "مكتمل", labelEn: "Completed" },
  ];

  const currentIndex = Math.max(
    steps.findIndex((s) => s.code === currentCode),
    0
  );

  return (
    <div className="w-full py-8 overflow-x-auto">
      <div className="hidden md:flex items-center justify-between relative min-w-[800px] px-4">
        {/* Background Line */}
        <div className="absolute left-0 top-6 w-full h-1.5 bg-gray-100 rounded-full -z-10" />

        {/* Active Progress Line */}
        <div
          className="absolute left-0 top-6 h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full -z-10 transition-all duration-700 ease-in-out"
          style={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const active = idx <= currentIndex;
          const isCurrent = idx === currentIndex; // The exact current step

          return (
            <div key={step.code} className="flex flex-col items-center gap-3 relative group">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-4 
                  transition-all duration-500 z-10 
                  ${active
                    ? "bg-gradient-to-br from-primary to-blue-600 border-white shadow-lg shadow-primary/20 scale-100"
                    : "bg-white border-gray-200 text-gray-300 scale-90"
                  }
                  ${isCurrent ? "ring-4 ring-primary/10 scale-110" : ""}
                `}
              >
                {active ? (
                  <svg className="w-5 h-5 text-white animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-xs md:text-sm font-bold text-center w-24 transition-colors duration-300
                  ${active ? "text-primary" : "text-gray-400"}
                `}
              >
                {lang === "ar" ? step.labelAr : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper Fallback */}
      <div className="md:hidden flex flex-col gap-6 pl-4 border-l-2 border-gray-100 ml-4 relative">
        <div
          className="absolute left-[-2px] top-0 w-0.5 bg-primary transition-all duration-500"
          style={{ height: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
        {steps.map((step, idx) => {
          const active = idx <= currentIndex;
          return (
            <div key={step.code} className={`flex items-center gap-4 ${!active ? 'opacity-50' : 'opacity-100'}`}>
              <div className={`w-3 h-3 rounded-full absolute -left-[7px] ${active ? 'bg-primary ring-4 ring-primary/10' : 'bg-gray-200'}`} />
              <span className={`text-sm font-bold ${active ? 'text-primary' : 'text-gray-500'}`}>
                {lang === "ar" ? step.labelAr : step.labelEn}
              </span>
              {active && idx === currentIndex && <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full">Current</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
