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
  const [paymentId, setPaymentId] = useState(null); // Store DB Payment ID
  const [createPayment, { isLoading, error }] = useCreatePaymentMutation();

  useEffect(() => {
    // إذا لم يكن Stripe متوفراً، لا تفعل شيء
    if (!stripePublishableKey || !stripePromise) {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        // 1. Create Payment Intent via Next.js API
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency: "sar" }),
        });
        
        const paymentData = await response.json();
        
        if (!response.ok) {
          throw new Error(paymentData.error || "Failed to create payment intent");
        }

        const { clientSecret: secret } = paymentData;
        const intentId = secret?.split('_secret_')[0] || null;

        // 2. Create pending payment record in Supabase
        const dbPayment = await createPayment({
          amount,
          currency: "sar",
          consultationId,
          stripePaymentIntentId: intentId,
          status: "pending",
        }).unwrap();
        
        if (dbPayment?.data?.id) {
            setPaymentId(dbPayment.data.id);
        } else if (dbPayment?.id) {
             setPaymentId(dbPayment.id);
        }

        // 3. Show Form
        setClientSecret(secret);

      } catch (err) {
        console.error("Payment setup error:", err);
        toast.error(
          err?.message || t("payment.stripeError") || "حدث خطأ أثناء إنشاء نية الدفع"
        );
      }
    };

    if (amount && consultationId) {
      createPaymentIntent();
    }
  }, [amount, consultationId, createPayment, t]);

  // إذا لم يكن Stripe متوفراً، لا تعرض أي شيء
  if (!stripePublishableKey || !stripePromise) {
    return null;
  }

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
  };

  return clientSecret ? (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm refetch={refetch} paymentId={paymentId} />
    </Elements>
  ) : isLoading ? (
    <p>جاري تحميل الدفع...</p>
  ) : error ? (
    <p>حدث خطأ أثناء تحميل الدفع</p>
  ) : null;
}
