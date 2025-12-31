import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getMoyasarPublishableKey, getMoyasarCallbackUrl } from "@/utils/env";

export default function MoyasarInlineForm({ amount, orderId }) {
  const { t } = useTranslation();
  const publishable = (getMoyasarPublishableKey() || "").trim();
  const callbackUrl = getMoyasarCallbackUrl();
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!publishable || !amount) return;

      // Load Moyasar CSS if not already present
      const cssId = "moyasar-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://cdn.moyasar.com/mpf/1.7.1/moyasar.css";
        document.head.appendChild(link);
      }

      if (typeof window !== "undefined" && window.Moyasar) {
        if (containerRef.current && window.Moyasar.init) {
          window.Moyasar.init();
        }
        return;
      }
      const scriptId = "moyasar-inline-script";
      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = "https://cdn.moyasar.com/mpf/1.7.1/moyasar.js";
        s.async = true;
        s.onload = () => {
          if (!mounted) return;
          if (containerRef.current && window.Moyasar && window.Moyasar.init) {
            window.Moyasar.init();
          }
        };
        document.body.appendChild(s);
      } else {
        if (containerRef.current && window.Moyasar && window.Moyasar.init) {
          window.Moyasar.init();
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [publishable, amount]);

  if (!publishable || !amount) {
    return null;
  }

  const minor = Math.round(Number(amount) * 100);
  const desc =
    (t("payment.title") || "الدفع") + (orderId ? ` (#${orderId})` : "");

  return (
    <div
      ref={containerRef}
      className="mysr-form"
      data-moyasar-pk={publishable}
      data-amount={minor}
      data-currency="SAR"
      data-description={desc}
      data-callback_url={callbackUrl}
      data-methods="creditcard,mada,applepay"
    />
  );
}
