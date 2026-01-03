"use server";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Supabase admin not configured" }, { status: 500 });
    }

    const url = new URL(request.url);
    const groupKey = url.searchParams.get("groupKey");
    const form = await request.formData();
    const files = form.getAll("files");
    const attachmentUploaderLookupIdRaw = form.get("attachmentUploaderLookupId");
    const requestPhaseCodeRaw = form.get("requestPhaseLookupId");

    if (!groupKey) {
      return NextResponse.json({ message: "Missing groupKey" }, { status: 400 });
    }
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    const { data: group } = await supabaseAdmin
      .from("attachment_groups")
      .select("id,group_key")
      .eq("group_key", groupKey)
      .maybeSingle();
    let groupId = group?.id || null;
    if (!groupId) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from("attachment_groups")
        .insert({ group_key: groupKey })
        .select("id")
        .single();
      if (createErr || !created?.id) {
        return NextResponse.json({ message: "Failed to create attachment group" }, { status: 500 });
      }
      groupId = created.id;
    }

    let requestPhaseLookupId = null;
    if (requestPhaseCodeRaw) {
      if (!isNaN(requestPhaseCodeRaw)) {
        requestPhaseLookupId = parseInt(requestPhaseCodeRaw);
      } else {
        const { data: type } = await supabaseAdmin
          .from("lookup_types")
          .select("id")
          .eq("code", "request-phase")
          .maybeSingle();
        if (type?.id) {
          const { data: phase } = await supabaseAdmin
            .from("lookup_values")
            .select("id")
            .eq("lookup_type_id", type.id)
            .eq("code", String(requestPhaseCodeRaw))
            .maybeSingle();
          requestPhaseLookupId = phase?.id || null;
        }
      }
    }

    let attachmentUploaderLookupId = null;
    if (attachmentUploaderLookupIdRaw) {
      if (!isNaN(attachmentUploaderLookupIdRaw)) {
        attachmentUploaderLookupId = parseInt(attachmentUploaderLookupIdRaw);
      } else {
        const { data: type } = await supabaseAdmin
          .from("lookup_types")
          .select("id")
          .eq("code", "attachment-uploader")
          .maybeSingle();
        if (type?.id) {
          const { data: uploader } = await supabaseAdmin
            .from("lookup_values")
            .select("id")
            .eq("lookup_type_id", type.id)
            .eq("code", String(attachmentUploaderLookupIdRaw))
            .maybeSingle();
          attachmentUploaderLookupId = uploader?.id || null;
        }
      }
    }

    const uploaded = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = Buffer.from(arrayBuffer);
      const ext = file.name.split(".").pop();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const path = `attachments/${groupId}/${unique}.${ext}`;

      const { data: storageRes, error: storageErr } = await supabaseAdmin.storage
        .from("attachments")
        .upload(path, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (storageErr) {
        return NextResponse.json({ message: "Storage upload failed", details: storageErr.message }, { status: 500 });
      }

      const { error: insertErr } = await supabaseAdmin
        .from("attachments")
        .insert({
          group_id: groupId,
          file_path: storageRes?.path || path,
          file_name: file.name,
          content_type: file.type || null,
          size_bytes: file.size || null,
          request_phase_lookup_id: requestPhaseLookupId,
          attachment_uploader_lookup_id: attachmentUploaderLookupId,
        });
      if (insertErr) {
        return NextResponse.json({ message: "Database insert failed", details: insertErr.message }, { status: 500 });
      }

      uploaded.push({ path: storageRes?.path || path, name: file.name });
    }

    return NextResponse.json({ ok: true, uploaded }, { status: 200 });
  } catch (e) {
    console.error("API Attachments Error:", e);
    return NextResponse.json({ message: "Unexpected error", details: String(e?.message || e) }, { status: 500 });
  }
}
