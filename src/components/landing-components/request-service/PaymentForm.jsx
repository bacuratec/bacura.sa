import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useCreatePaymentMutation } from "../../../redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const stripePublishableKey = 
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : null) ||
  (typeof process !== "undefined" ? process.env.VITE_STRIPE_PUBLISHABLE_KEY : null) ||
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY : null) ||
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_ENV_SECRETS : null) ||
  null;

// فقط حمّل Stripe إذا كان المفتاح موجوداً وصحيحاً
const stripePromise = stripePublishableKey && stripePublishableKey.trim() 
  ? loadStripe(stripePublishableKey.trim()) 
  : null;

export default function PaymentForm({ amount, consultationId, refetch }) {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState("");
  const [createPayment, { isLoading, error }] = useCreatePaymentMutation();

  // إذا لم يكن Stripe متوفراً، لا تعرض أي شيء
  if (!stripePublishableKey || !stripePromise) {
    return null;
  }

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const data = await createPayment({
          amount,
          currency: "sar",
          consultationId,
        }).unwrap();
        setClientSecret(data.clientSecret);
      } catch (err) {
        toast.error(
          err?.data?.message || t("payment.stripeError") || "حدث خطأ أثناء إنشاء نية الدفع"
        );
      }
    };

    if (amount && consultationId) {
      createPaymentIntent();
    }
  }, [amount, consultationId, createPayment, t]);

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
  };

  return clientSecret ? (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm refetch={refetch} />
    </Elements>
  ) : isLoading ? (
    <p>جاري تحميل الدفع...</p>
  ) : error ? (
    <p>حدث خطأ أثناء تحميل الدفع</p>
  ) : null;
}
