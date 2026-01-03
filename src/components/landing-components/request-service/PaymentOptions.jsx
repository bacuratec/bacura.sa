"use client";

import { useState } from "react";
import PaymentForm from "./PaymentForm";
import axios from "axios";
import { useCreatePaymentMutation } from "@/redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import { getAppBaseUrl } from "@/utils/env";
import { useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";

export default function PaymentOptions({ amount, requestId, attachmentsGroupKey, refetch }) {
  const { t } = useTranslation();
  const tr = (k, f) => trHelper(t, k, f);
  const [method, setMethod] = useState("bank");
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");

  // Try to get userId and role from Redux first
  const { userId: reduxUserId, role: reduxRole } = useSelector((state) => state.auth || {});

  const onUploadChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const submitManual = async (pm) => {
    try {
      let userId = reduxUserId;

      // Fallback to session or localStorage if not in Redux
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
      }

      if (!userId && typeof window !== "undefined") {
        userId = JSON.parse(localStorage.getItem("user"))?.id || null;
      }

      if (!userId) {
        toast.error(tr("payment.errorUser", "لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى."));
        return;
      }

      // Upload receipt(s) as attachments directly to Supabase (authenticated users only)
      if (files.length > 0) {
        if (!supabase) {
          toast.error(tr("payment.errorNoSupabase", "خطأ: إعداد Supabase غير موجود. تحقق من المتغيرات البيئية."));
          return;
        }

        // Ensure the user is authenticated and we have an ID
        let uid = userId;
        if (!uid) {
          const { data: { session } } = await supabase.auth.getSession();
          uid = session?.user?.id;
        }

        if (!uid) {
          toast.error(tr("payment.errorUser", "لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى."));
          return;
        }

        // Resolve or create attachment group
        let groupKey = attachmentsGroupKey;
        let groupId = null;

        try {
          if (groupKey) {
            const { data: group } = await supabase.from("attachment_groups").select("id,group_key").eq("group_key", groupKey).maybeSingle();
            groupId = group?.id || null;
          }

          if (!groupId) {
            // create a new group on behalf of the user (RLS should allow this when created_by_user_id = auth.uid())
            groupKey = groupKey || `group_${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
            const { data: created, error: createErr } = await supabase
              .from("attachment_groups")
              .insert({ group_key: groupKey, created_by_user_id: uid })
              .select("id,group_key")
              .single();

            if (createErr) {
              console.error("Failed to create attachment group (client):", createErr);
              toast.error(tr("payment.errorGroupCreate", "تعذر إنشاء مجموعة المرفقات. تحقق من صلاحيات قاعدة البيانات."));
              return;
            }
            groupId = created.id;
          }

          // Upload each file to storage and create attachments record
          for (const file of files) {
            const ext = file.name.split(".").pop();
            const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const path = `attachments/${groupId}/${unique}.${ext}`;

            const { data: storageRes, error: storageErr } = await supabase.storage
              .from("attachments")
              .upload(path, file, { cacheControl: "3600", upsert: false });

            if (storageErr) {
              console.error("Storage upload error:", storageErr);
              toast.error(tr("payment.errorUpload", "فشل في رفع بعض الملفات"));
              return;
            }

            // Resolve uploader lookup id by code (map by user role)
            let uploaderLookupId = null;
            try {
              // map role => uploader code (string)
              const roleToCode = {
                Provider: '700',
                Requester: '701',
                Admin: '702',
              };
              const uploaderCode = roleToCode[reduxRole] || '701'; // default to Requester

              // Get lookup_type id
              const { data: lt } = await supabase.from('lookup_types').select('id').eq('code', 'attachment-uploader').maybeSingle();
              if (lt?.id) {
                const { data: lv } = await supabase
                  .from('lookup_values')
                  .select('id')
                  .eq('lookup_type_id', lt.id)
                  .eq('code', String(uploaderCode))
                  .maybeSingle();
                uploaderLookupId = lv?.id || null;
              }
            } catch (err) {
              console.warn('Could not resolve uploader lookup id:', err);
            }

            // Build insert payload - include uploader only if resolved
            const insertPayload = {
              group_id: groupId,
              file_path: storageRes?.path || path,
              file_name: file.name,
              content_type: file.type || null,
              size_bytes: file.size || null,
              request_phase_lookup_id: 25,
            };
            if (uploaderLookupId) insertPayload.attachment_uploader_lookup_id = uploaderLookupId;

            const { error: insertErr } = await supabase.from("attachments").insert(insertPayload);

            if (insertErr) {
              console.error("Database insert error (attachments):", insertErr);
              // PostgREST schema error (missing column) => show actionable message
              if (insertErr?.code === "PGRST204" || (insertErr?.message || "").toLowerCase().includes("could not find")) {
                toast.error("خطأ في قاعدة البيانات: عمود مفقود (attachment_uploader_lookup_id). يرجى تشغيل ترحيل قاعدة البيانات.");
              } else {
                toast.error(tr("payment.errorInsert", "فشل في تسجيل المرفق"));
              }
              return;
            }
          }

        } catch (uploadErr) {
          console.error("Error uploading attachments directly:", uploadErr);
          toast.error(tr("payment.errorUploadGeneric", "حدث خطأ أثناء رفع المرفقات"));
          return;
        }
      }

      // Create payment submission
      await createPayment({
        amount,
        currency: "sar",
        requestId,
        userId,
        status: "pending",
        paymentMethod: pm,
        paymentStatus: "submitted",
      }).unwrap();
      toast.success(tr("payment.submitted", "تم إرسال الطلب للمراجعة"));
      setFiles([]);
      setNotes("");
      if (typeof refetch === "function") refetch();
    } catch (err) {
      console.error(err);
      toast.error(tr("payment.errorSubmit", "تعذر إرسال الدفع، حاول لاحقًا"));
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`px-4 py-3 rounded-2xl border text-sm font-bold ${method === "card" ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-gray-700"}`}
        >
          {tr("payment.method.card", "بطاقة إلكترونية")}
        </button>
        <button
          type="button"
          onClick={() => setMethod("bank")}
          className={`px-4 py-3 rounded-2xl border text-sm font-bold ${method === "bank" ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-gray-700"}`}
        >
          {tr("payment.method.bank", "تحويل بنكي")}
        </button>
        <button
          type="button"
          onClick={() => setMethod("cash")}
          className={`px-4 py-3 rounded-2xl border text-sm font-bold ${method === "cash" ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-gray-700"}`}
        >
          {tr("payment.method.cash", "تسليم نقدي")}
        </button>
      </div>

      {method === "card" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <div className="font-black mb-2">{tr("payment.card.dev", "بطاقة إلكترونية — قيد التطوير")}</div>
          <p className="text-sm">{tr("payment.card.devDesc", "سيتم إتاحة الدفع بالبطاقة قريبًا. يمكنك استخدام التحويل البنكي أو التسليم نقدًا ورفع الإيصال.")}</p>
        </div>
      )}

      {method !== "card" && (
        <div className="space-y-4">
          {method === "bank" && (
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h4 className="font-black text-gray-900 mb-4">{tr("payment.bank.title", "بيانات التحويل البنكي")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{tr("payment.bank.nameLabel", "البنك")}</div>
                  <div className="font-bold text-gray-900">{tr("payment.bank.name", "بنك الأهلي")}</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{tr("payment.bank.beneficiaryLabel", "اسم المستفيد")}</div>
                  <div className="font-bold text-gray-900">{tr("payment.bank.beneficiary", "شركة باكورة التقنيات للمقاولات")}</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{tr("payment.bank.ibanLabel", "رقم الآيبان")}</div>
                  <div className="font-mono text-sm font-bold text-gray-900">SA1710000049400000475403</div>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-500">{tr("payment.amount", "المبلغ")}</label>
                <div className="mt-1 px-4 py-3 rounded-xl bg-white border border-gray-200 font-bold text-gray-900">{Number(amount).toFixed(2)} SAR</div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500">{tr("payment.notes", "ملاحظات")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm"
                  placeholder={tr("payment.notes.placeholder", "مثال: رقم التحويل/المرجع")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-black text-gray-500 mb-2 block">{tr("payment.receiptUpload", "رفع إيصال الدفع")}</label>
                <label
                  htmlFor="payment-receipt"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl px-6 py-10 cursor-pointer text-center hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m5-7-5-5-5 5M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-primary">
                    {tr("payment.uploadPrompt", "قم برفع الإيصال (صورة/ملف)")}
                  </span>
                  <input id="payment-receipt" type="file" multiple className="hidden" onChange={onUploadChange} />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 list-disc pr-4">
                    {files.map((f, i) => <li key={i}>{f.name}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => submitManual(method === "bank" ? "bank_transfer" : "cash")}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-primary/90"
            >
              {tr("payment.submitForReview", "إرسال للمراجعة")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
