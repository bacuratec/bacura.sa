// import {
//   useStripe,
//   useElements,
//   PaymentElement,
// } from "@stripe/react-stripe-js";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { useCreateOrderMutation } from "../../../redux/api/ordersApi";

// export default function CheckoutForm({ payload }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();
//   const [createOrder] = useCreateOrderMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;
//     setLoading(true);

//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       confirmParams: { return_url: window.location.href },
//       redirect: "if_required",
//     });

//     if (error) {
//       setMessage(error.message);
//       setLoading(false);
//       return;
//     }

//     if (paymentIntent?.status === "succeeded") {
//       setMessage("تم الدفع بنجاح");

//       try {
//         await createOrder(payload).unwrap();
//         toast.success("تم الدفع وإنشاء الطلب بنجاح");
//         navigate("/login");
//       } catch (err) {
//         console.error("فشل في إنشاء الأوردر:", err);
//         toast.error("تم الدفع ولكن فشل إنشاء الطلب، راجع الدعم");
//       }
//     }

//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <PaymentElement />
//       <button
//         type="submit"
//         disabled={loading || !stripe || !elements}
//         className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
//       >
//         {loading ? "جاري الدفع..." : "ادفع الآن"}
//       </button>
//       {message && <div className="mt-2 text-red-500">{message}</div>}
//     </form>
//   );
// }

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useUpdatePaymentStatusMutation } from "../../../redux/api/paymentApi";

export default function CheckoutForm({ refetch, paymentId }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const location = { pathname };
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // ✅ أولاً: بدء الدفع
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setMessage(t("payment.succeeded"));
        
        // تحديث حالة الدفع في قاعدة البيانات
        if (paymentId) {
            try {
                await updatePaymentStatus({
                    id: paymentId,
                    body: {
                        status: "succeeded",
                        stripePaymentIntentId: paymentIntent.id
                    }
                }).unwrap();
            } catch (updateErr) {
                console.error("Failed to update payment status in DB:", updateErr);
                // لا نوقف العملية لأن الدفع تم بالفعل في Stripe
            }
        }

        toast.success(t("payment.success"));
        if (location?.pathname?.includes("requests/")) {
          refetch();
        }
        navigate("/"); // غير المسار حسب المطلوب
      } else {
        setMessage(t("payment.notConfirmed"));
      }
    } catch (err) {
      toast.error(
        err?.data?.message || t("payment.failed") || "حدث خطأ أثناء الدفع"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
      >
        {loading ? t("payment.processing") : t("payment.payNow")}
      </button>
      {message && <div className="mt-2 text-red-500">{message}</div>}
    </form>
  );
}
