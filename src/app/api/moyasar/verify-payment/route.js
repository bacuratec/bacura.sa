import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Verify Moyasar payment by ID and update DB status.
 * Body: { paymentId:string }
 */
export async function POST(request) {
  try {
    const secretKey =
      process.env.MOYASAR_SECRET_KEY ||
      process.env.NEXT_PUBLIC_MOYASAR_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Moyasar secret key is missing in environment" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { paymentId } = body || {};
    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const res = await fetch(
      `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch payment", details: data },
        { status: res.status || 500 }
      );
    }

    const status = data?.status || "unknown";
    const invoiceId =
      data?.invoice_id || data?.invoice?.id || data?.source?.invoice_id || null;

    let updated = null;
    if (supabaseAdmin && invoiceId) {
      // Find payment by stored invoiceId (saved in stripe_payment_intent_id)
      const found = await supabaseAdmin
        .from("payments")
        .select("id,status")
        .eq("stripe_payment_intent_id", invoiceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!found.error && found.data?.id) {
        const upRes = await supabaseAdmin
          .from("payments")
          .update({
            status: status === "paid" ? "succeeded" : status,
            stripe_payment_intent_id: invoiceId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", found.data.id)
          .select("id,status")
          .single();
        if (!upRes.error) {
          updated = upRes.data;
        }
      }
    }

    return NextResponse.json({
      status,
      invoiceId,
      updatedPayment: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
