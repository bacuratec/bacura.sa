import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useCreatePaymentMutation } from "../../../redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const stripePublishableKey = 
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_ENV_SECRETS || 
  "";

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function PaymentForm({ amount, consultationId, refetch }) {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState("");
  // "pi_3Rqfo7CD3Txa0lrN1VOTs56E_secret_6au6fSlEiZP62p5YCwjh3mDk7"
  const [createPayment, { isLoading, error }] = useCreatePaymentMutation();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const data = await createPayment({
          amount,
          currency: "sar",
          consultationId,
        }).unwrap(); // unwrap بيطلعلك الـ data مباشرة من الـ response
        setClientSecret(data.clientSecret); // تأكد إن ده نفس الاسم اللي API بيرجعه
      } catch (err) {
        toast.error(
          err?.data?.message || t("payment.stripeError") || "حدث خطأ أثناء إنشاء نية الدفع"
        );
      }
    };

    if (amount && consultationId) {
      createPaymentIntent();
    }
  }, [amount, consultationId, createPayment]);

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
  };

  if (!stripePromise) {
    console.warn("Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY environment variable.");
    return <p>Stripe غير متاح حالياً. يرجى التحقق من إعدادات المفاتيح.</p>;
  }

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
