import { NextResponse } from "next/server";
/**
 * Create Moyasar Invoice and return redirect URL
 * Body: { amount:number, currency?:string, description?:string, orderId?:string, supportedSources?:string[] }
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
    const {
      amount,
      currency = "SAR",
      description = "Service Request Payment",
      orderId,
      supportedSources = ["creditcard", "mada", "applepay"],
      callbackUrl =
        process.env.NEXT_PUBLIC_MOYASAR_CALLBACK_URL ||
        process.env.VITE_MOYASAR_CALLBACK_URL ||
        (typeof window !== "undefined" ? window.location.origin : ""),
    } = body || {};

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: "Invalid amount provided" },
        { status: 400 }
      );
    }

    const minorAmount = Math.round(Number(amount) * 100);
    const payload = {
      amount: minorAmount,
      currency,
      description: orderId ? `${description} (#${orderId})` : description,
      callback_url: callbackUrl,
      supported_sources: supportedSources,
    };

    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const res = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to create invoice", details: data },
        { status: res.status || 500 }
      );
    }

    const invoiceUrl = data?.url || data?.invoice_url || null;
    return NextResponse.json({
      invoiceId: data?.id || null,
      invoiceUrl,
      status: data?.status || "created",
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
