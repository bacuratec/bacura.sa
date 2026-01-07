
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { Check, Clock, DollarSign, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

const RequestLifecycle = ({ request }) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    if (!request) return null;

    // Status Codes mapping
    // 7: Pending (New)
    // 8: Priced
    // 21: Waiting Payment (or Accepted by user)
    // 204: Paid
    // 207: Under Review (Maybe between New and Priced?)
    // 11: Completed
    // 17, 18, 13: Project statuses (Provider assigned etc)

    // We want to visualize: Received -> Priced -> Paid -> Provider Assigned -> Completed
    // Or: Received -> Priced -> Paid -> Completed (Provider Assignment is parallel)

    /* 
      Steps:
      1. New (Received)
      2. Priced (Admin Action)
      3. Paid (User Action)
      4. Execution (Provider Working)
      5. Completed
    */

    const steps = [
        {
            id: "new",
            label: t("requestSteps.new") || "بيانات الطلب",
            icon: <Clock className="w-5 h-5" />,
            status: "completed", // Always completed if request exists
            date: request.created_at,
            description: t("requestSteps.newDesc") || "تم استلام الطلب",
        },
        {
            id: "priced",
            label: t("requestSteps.priced") || "التسعير",
            icon: <DollarSign className="w-5 h-5" />,
            status: request.admin_price ? "completed" : "current", // If price set, completed
            date: request.updated_at, // Use updated_at logic
            description: request.admin_price ? `${formatPrice(request.admin_price)} SAR` : (t("requestSteps.pricedPending") || "بانتظار التسعير"),
        },
        {
            id: "paid",
            label: t("requestSteps.payment") || "الدفع",
            icon: <CheckCircle2 className="w-5 h-5" />,
            status: isPaid(request) ? "completed" : (request.admin_price ? "current" : "pending"),
            date: request.payment_status === "paid" ? request.updated_at : null,
            description: isPaid(request) ? (t("requestSteps.paidDone") || "تم الدفع") : (t("requestSteps.paidPending") || "بانتظار الدفع"),
        },
        {
            id: "execution",
            label: t("requestSteps.execution") || "التنفيذ",
            icon: <UserCheck className="w-5 h-5" />,
            status: isProjectStarted(request) || request.provider_response === 'accepted' ? "completed" : (isPaid(request) ? "current" : "pending"),
            description: request.provider_response === 'accepted'
                ? (t("requestSteps.providerAccepted") || "تم قبول الطلب من " + (request.provider?.name || ""))
                : request.provider_response === 'rejected'
                    ? (t("requestSteps.providerRejected") || "تم الرفض من المزود")
                    : request.provider
                        ? (t("requestSteps.waitingProvider") || "بانتظار موافقة " + request.provider.name)
                        : (t("requestSteps.providerPending") || "تعيين مزود"),
        },
        {
            id: "completed",
            label: t("requestSteps.completed") || "الإكمال",
            icon: <Check className="w-5 h-5" />,
            status: isCompleted(request) ? "completed" : "pending",
            date: request.completed_at,
            description: isCompleted(request) ? (t("requestSteps.completedDone") || "تم الإكمال") : "",
        }
    ];

    function formatPrice(price) {
        return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(price);
    }

    function isPaid(req) {
        return req.status?.code === 'paid' || req.payment_status === 'paid' || [204, 11, 13, 15, 17, 18, 19, 20].includes(req.status_id);
    }

    function isProjectStarted(req) {
        // If status is one of project statuses
        return [11, 13, 15, 17, 18].includes(req.status_id);
    }

    function isCompleted(req) {
        return req.status_id === 11 || req.status_id === 15; // 11 is 'completed' in requests, 15 is 'completed' in orders?
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {t("requestLifecycle.title") || "دورة حياة الطلب"}
            </h3>

            <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full -z-0">
                    {/* Progress Bar Background */}
                </div>

                {/* Progress Bar Foreground - simple logic for now */}
                {/* <div className="absolute top-5 transition-all duration-500 h-1 bg-green-500 rounded-full -z-0" style={{ width: '50%' }}></div> */}

                <div className="flex justify-between relative z-10 w-full">
                    {steps.map((step, index) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';
                        const isPending = step.status === 'pending';

                        let colorClass = isCompleted ? "bg-green-500 text-white ring-green-100" : (isCurrent ? "bg-blue-600 text-white ring-blue-100" : "bg-white text-gray-300 border-2 border-gray-200");
                        if (isPending) colorClass = "bg-white text-gray-300 border-2 border-gray-200";

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-opacity-50 ${colorClass}`}>
                                    {step.icon}
                                </div>
                                <div className={`mt-3 text-center transition-all duration-300 ${isCurrent ? 'scale-105' : ''}`}>
                                    <p className={`text-xs font-bold ${isCompleted ? 'text-green-700' : (isCurrent ? 'text-blue-700' : 'text-gray-400')}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-gray-500 max-w-[80px] mt-1 leading-tight mx-auto">
                                        {step.description}
                                    </p>
                                    {step.date && (
                                        <p className="text-[9px] text-gray-400 mt-1 font-mono">
                                            {dayjs(step.date).format("DD/MM/YYYY")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default RequestLifecycle;
