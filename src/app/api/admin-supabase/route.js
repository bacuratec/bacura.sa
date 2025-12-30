import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/utils/env";

function getServiceClient() {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "";
  if (!url || !key) {
    return { supabase: null, error: "Missing Supabase service role configuration" };
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
    global: { headers: { "x-admin-api": "bacura-admin" } },
  });
  return { supabase, error: null };
}

export async function GET(req) {
  try {
    const { supabase, error: initError } = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: initError }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");
    if (!table) {
      return NextResponse.json({ error: "Missing table param" }, { status: 400 });
    }
    const select = searchParams.get("select") || "*";
    const orderBy = searchParams.get("orderBy") || null;
    const orderAsc = (searchParams.get("orderAsc") || "true") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") || "0", 10) : null;
    const id = searchParams.get("id") || null;

    let query = supabase.from(table).select(select);
    if (id) query = query.eq("id", id);
    if (orderBy) query = query.order(orderBy, { ascending: orderAsc });
    if (limit && Number.isFinite(limit)) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { supabase, error: initError } = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: initError }, { status: 500 });
    }
    const body = await req.json();
    const { table, values } = body || {};
    if (!table || !values) {
      return NextResponse.json({ error: "Missing table or values" }, { status: 400 });
    }
    const { data, error } = await supabase.from(table).insert(values).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { supabase, error: initError } = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: initError }, { status: 500 });
    }
    const body = await req.json();
    const { table, id, match, values } = body || {};
    if (!table || !values || (!id && !match)) {
      return NextResponse.json({ error: "Missing table, values or match" }, { status: 400 });
    }
    let query = supabase.from(table).update(values);
    if (id) {
      query = query.eq("id", id);
    } else if (match && typeof match === "object") {
      Object.entries(match).forEach(([k, v]) => {
        query = query.eq(k, v);
      });
    }
    const { data, error } = await query.select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { supabase, error: initError } = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: initError }, { status: 500 });
    }
    const body = await req.json();
    const { table, id, match } = body || {};
    if (!table || (!id && !match)) {
      return NextResponse.json({ error: "Missing table or match" }, { status: 400 });
    }
    let query = supabase.from(table).delete();
    if (id) {
      query = query.eq("id", id);
    } else if (match && typeof match === "object") {
      Object.entries(match).forEach(([k, v]) => {
        query = query.eq(k, v);
      });
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
