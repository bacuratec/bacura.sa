import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getMoyasarPublishableKey } from "@/utils/env";

export default function MoyasarInvoiceButton({ amount, orderId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const publishable = getMoyasarPublishableKey();

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/moyasar/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "SAR",
          description: t("payment.title") || "الدفع",
          orderId,
          supportedSources: ["creditcard", "mada", "applepay"],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.invoiceUrl) {
        throw new Error(data?.error || "فشل إنشاء فاتورة الدفع");
      }
      window.location.href = data.invoiceUrl;
    } catch (err) {
      toast.error(err?.message || "حدث خطأ أثناء بدء الدفع عبر Moyasar");
    } finally {
      setLoading(false);
    }
  };

  if (!publishable) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#1a9f5a] py-3 rounded-xl text-white font-bold hover:bg-[#15894c] transition-all mt-4"
    >
      {loading
        ? t("payment.processing") || "جاري المعالجة..."
        : t("payWithMoyasar") || "الدفع عبر Moyasar"}
    </button>
  );
}
