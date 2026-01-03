"use client";

import { useState } from "react";
import PaymentForm from "./PaymentForm";
import { useCreatePaymentMutation } from "@/redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
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

      // Upload receipt(s) as attachments directly to Supabase
      if (files.length > 0) {
        if (!supabase) {
          toast.error(tr("payment.errorNoSupabase", "خطأ: إعداد Supabase غير موجود. تحقق من المتغيرات البيئية."));
          return;
        }

        let uid = userId;
        let groupKey = attachmentsGroupKey;
        let groupId = null;

        try {
          // 1. Resolve or Create Group
          if (groupKey) {
            const { data: group } = await supabase.from("attachment_groups").select("id,group_key").eq("group_key", groupKey).maybeSingle();
            groupId = group?.id || null;
          }

          if (!groupId) {
            groupKey = groupKey || `group_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            const { data: created, error: createErr } = await supabase
              .from("attachment_groups")
              .insert({ group_key: groupKey, created_by_user_id: uid })
              .select("id,group_key")
              .single();

            if (createErr) {
              console.error("Failed to create attachment group:", createErr);
              toast.error(tr("payment.errorGroupCreate", "تعذر إنشاء مجموعة المرفقات."));
              return;
            }
            groupId = created.id;

            if (requestId) {
              await supabase.from("requests").update({ attachments_group_key: groupKey }).eq("id", requestId);
            }
          }

          // 2. Resolve Uploader Lookup
          let uploaderLookupId = null;
          try {
            const roleToCode = { Provider: '700', Requester: '701', Admin: '702' };
            const uploaderCode = roleToCode[reduxRole] || '701';
            const { data: lt } = await supabase.from('lookup_types').select('id').eq('code', 'attachment-uploader').maybeSingle();
            if (lt?.id) {
              const { data: lv } = await supabase.from('lookup_values').select('id').eq('lookup_type_id', lt.id).eq('code', String(uploaderCode)).maybeSingle();
              uploaderLookupId = lv?.id || null;
            }
          } catch (err) {
            console.warn('Could not resolve uploader lookup id:', err);
          }

          // 3. Upload each file
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
              continue;
            }

            const insertPayload = {
              group_id: groupId,
              file_path: storageRes?.path || path,
              file_name: file.name,
              content_type: file.type || null,
              size_bytes: file.size || null,
              request_phase_lookup_id: 25,
            };
            if (uploaderLookupId) insertPayload.attachment_uploader_lookup_id = uploaderLookupId;

            await supabase.from("attachments").insert(insertPayload);
          }
        } catch (uploadErr) {
          console.error("Error in attachment workflow:", uploadErr);
          toast.error(tr("payment.errorUploadGeneric", "حدث خطأ أثناء معالجة المرفقات"));
          return;
        }
      }

      // 4. Create payment entry
      await createPayment({
        amount,
        currency: "sar",
        requestId,
        userId,
        status: "pending",
        paymentMethod: pm,
        paymentStatus: "submitted",
        notes: notes || ""
      }).unwrap();

      toast.success(tr("payment.submitted", "تم إرسال الطلب للمراجعة"));
      setFiles([]);
      setNotes("");
      if (typeof refetch === "function") refetch();
    } catch (err) {
      console.error("Payment submission error:", err);
      toast.error(tr("payment.errorSubmit", "تعذرإرسال الدفع، حاول لاحقًا"));
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
          {tr("payment.method.cash", "دفع كاش")}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        {method === "card" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{tr("payment.cardDesc", "سيتم توجيهك لبوابة الدفع لإتمام المعاملة ببطاقة مدى أو فيزا.")}</p>
            <PaymentForm amount={amount} requestId={requestId} onSuccess={() => refetch && refetch()} />
          </div>
        )}

        {method === "bank" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-900">{tr("payment.bankDetails", "بيانات التحويل البنكي")}</h4>
              <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">اسم البنك:</span>
                  <span className="font-bold">بنك الراجحي</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">رقم الحساب:</span>
                  <span className="font-bold">123456789012345</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">IBAN:</span>
                  <span className="font-bold">SA12345678901234567890</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{tr("payment.uploadReceipt", "رفع إيصال التحويل")}</label>
                <input
                  type="file"
                  multiple
                  onChange={onUploadChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{tr("payment.notes", "ملاحظات إضافية")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm focus:border-primary/50 outline-none transition-all h-24"
                  placeholder={tr("payment.notesPlaceholder", "أدخل رقم الحوالة أو اسم المحول...")}
                />
              </div>

              <button
                onClick={() => submitManual("bank")}
                disabled={isLoading || files.length === 0}
                className="w-full premium-gradient-secondary text-white py-4 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isLoading ? "..." : tr("payment.confirmBank", "تأكيد التحويل وإرسال الإيصال")}
              </button>
            </div>
          </div>
        )}

        {method === "cash" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{tr("payment.cashDesc", "يمكنك سداد المبلغ كاش في مقر الشركة أو عند تسليم المشروع.")}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary/50 outline-none transition-all h-24"
              placeholder={tr("payment.notesPlaceholder", "أدخل تفاصيل الدفع النقدي المتفق عليها...")}
            />
            <button
              onClick={() => submitManual("cash")}
              disabled={isLoading}
              className="w-full premium-gradient-primary text-white py-4 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isLoading ? "..." : tr("payment.confirmCash", "تأكيد الدفع النقدي")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
