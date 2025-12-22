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
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function CheckoutForm({ refetch }) {
  const { t } = useTranslation();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // ✅ أولاً: إنشاء الأوردر
      // ✅ ثانياً: بدء الدفع
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
        toast.success(t("payment.success"));
        if (location?.pathname?.includes("requests/")) {
          refetch();
        }
        navigate("/"); // غير المسار حسب المطلوب
      } else {
        setMessage(t("payment.notConfirmed"));
      }
    } catch (err) {
      console.error("فشل في إنشاء الأوردر أو الدفع:", err);
      toast.error(t("payment.failed"));
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
