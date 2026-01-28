import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMoyasarPublishableKey, getMoyasarCallbackUrl } from "@/utils/env";

export default function MoyasarInlineForm({ amount, requestId }) {
  const { t } = useTranslation();
  // Use user provided key as hardcoded fallback if env read fails
  const publishable = (getMoyasarPublishableKey() || "pk_test_V1Lb6Faw9ccLDmDT5brsz3GHQa7r6FDzEHNgptXk").trim();
  const callbackUrl = getMoyasarCallbackUrl();
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading, ready, error

  useEffect(() => {
    let checkInterval;

    const initMoyasar = () => {
      if (window.Moyasar && containerRef.current && status !== 'ready') {
        try {
          // Clear previous contents if any
          containerRef.current.innerHTML = '';

          const minor = Math.round(Number(amount) * 100);
          const desc = (t("payment.title") || "الدفع") + (requestId ? ` (#${requestId})` : "");

          console.log("Initializing Moyasar with:", { amount: minor, currency: 'SAR', desc });

          window.Moyasar.init({
            element: containerRef.current,
            amount: minor,
            currency: "SAR",
            description: desc,
            publishable_api_key: publishable,
            callback_url: callbackUrl,
            methods: ["creditcard", "mada", "applepay"],
          });
          setStatus('ready');
        } catch (e) {
          console.error("Moyasar init error:", e);
        }
      }
    };

    if (!publishable || !amount) {
      console.error("Missing Moyasar config", { publishable, amount });
      setStatus('error');
      return;
    }

    const scriptUrl = "https://cdn.moyasar.com/mpf/1.7.1/moyasar.js";
    const cssUrl = "https://cdn.moyasar.com/mpf/1.7.1/moyasar.css";

    // Load CSS
    if (!document.getElementById("moyasar-css")) {
      const link = document.createElement("link");
      link.id = "moyasar-css";
      link.rel = "stylesheet";
      link.href = cssUrl;
      document.head.appendChild(link);
    }

    // Load JS
    if (window.Moyasar) {
      initMoyasar();
    } else {
      if (!document.getElementById("moyasar-script")) {
        const script = document.createElement("script");
        script.id = "moyasar-script";
        script.src = scriptUrl;
        script.async = true;
        script.onload = initMoyasar;
        script.onerror = () => setStatus('error');
        document.body.appendChild(script);
      } else {
        // Script already added but maybe loading
        checkInterval = setInterval(() => {
          if (window.Moyasar) {
            clearInterval(checkInterval);
            initMoyasar();
          }
        }, 200);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [publishable, amount, callbackUrl, requestId]);

  if (!publishable || !amount) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">خطأ في إعدادات الدفع: البيانات ناقصة</div>;
  }

  return (
    <div className="w-full relative min-h-[350px]">
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl z-20">
          <svg className="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-bold text-gray-500">جاري تحميل بوابة الدفع...</span>
        </div>
      )}
      {/* Use simple div ref for strict init */}
      <div ref={containerRef} className="mysr-form relative z-10 p-1"></div>
    </div>
  );
}
