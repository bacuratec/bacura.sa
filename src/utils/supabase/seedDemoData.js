import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const tryTable = async (table) => {
  const res = await supabase.from(table).select("*").range(0, 0);
  return !res.error;
};

const ensureService = async (svc) => {
  const { data } = await supabase
    .from("services")
    .select("id,name_en")
    .ilike("name_en", svc.name_en)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      name_ar: svc.name_ar,
      name_en: svc.name_en,
      description_ar: svc.description_ar || null,
      description_en: svc.description_en || null,
      price: svc.price ?? null,
      image_url: svc.image_url || null,
      is_active: svc.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureRequester = async (rq) => {
  const { data } = await supabase
    .from("requesters")
    .select("id,name")
    .ilike("name", rq.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("requesters")
    .insert({
      name: rq.name,
      email: rq.email || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureProvider = async (pv) => {
  const { data } = await supabase
    .from("providers")
    .select("id,name")
    .ilike("name", pv.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("providers")
    .insert({
      name: pv.name,
      specialization: pv.specialization || null,
      avg_rate: pv.avg_rate || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureRequest = async (req) => {
  const { data } = await supabase
    .from("requests")
    .select("id,title")
    .ilike("title", req.title)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("requests")
    .insert({
      title: req.title,
      description: req.description || null,
      requester_id: req.requester_id,
      service_id: req.service_id,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureOrder = async (ord) => {
  const { data } = await supabase
    .from("orders")
    .select("id,request_id,provider_id")
    .eq("request_id", ord.request_id)
    .eq("provider_id", ord.provider_id)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("orders")
    .insert({
      order_title: ord.order_title || null,
      order_status_id: ord.order_status_id || 600,
      request_id: ord.request_id,
      provider_id: ord.provider_id,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

export async function seedDemoData() {
  if (!supabase) {
    toast.error("Supabase client غير مهيأ. تأكد من إعداد مفاتيح البيئة.");
    return { ok: false, message: "supabase not initialized" };
  }
  try {
    const servicesOk = await tryTable("services");
    const requestersOk = await tryTable("requesters");
    const providersOk = await tryTable("providers");
    const requestsOk = await tryTable("requests");
    const ordersOk = await tryTable("orders");

    const svcIds = [];
    if (servicesOk) {
      const baseServices = [
        { name_ar: "استشارة تقنية", name_en: "Tech Consulting", price: 300, is_active: true },
        { name_ar: "تصميم واجهات", name_en: "UI Design", price: 500, is_active: true },
        { name_ar: "تحليل المتطلبات", name_en: "Requirements Analysis", price: 400, is_active: true },
      ];
      for (const s of baseServices) {
        const id = await ensureService(s);
        svcIds.push(id);
      }
    }

    let rqId = null;
    if (requestersOk) {
      rqId = await ensureRequester({ name: "Ahmed Requester", email: "ahmed.requester@example.com" });
    }

    let pvId = null;
    if (providersOk) {
      pvId = await ensureProvider({ name: "Khalid Provider", specialization: "Design", avg_rate: 4.6 });
    }

    let reqId = null;
    if (requestsOk && rqId && svcIds.length > 0) {
      reqId = await ensureRequest({
        title: "واجهة صفحة تسجيل",
        description: "تصميم واجهة صفحة تسجيل متجاوبة",
        requester_id: rqId,
        service_id: svcIds[1],
      });
    }

    if (ordersOk && reqId && pvId) {
      await ensureOrder({
        order_title: "طلب تصميم واجهة",
        order_status_id: 601,
        request_id: reqId,
        provider_id: pvId,
      });
      await ensureOrder({
        order_title: "طلب تحليل متطلبات",
        order_status_id: 603,
        request_id: await ensureRequest({
          title: "تحليل مشروع CRM",
          description: "تحليل متطلبات نظام إدارة علاقات العملاء",
          requester_id: rqId,
          service_id: svcIds[2],
        }),
        provider_id: pvId,
      });
    }

    toast.success("تم إدخال بيانات تجريبية بنجاح");
    return { ok: true };
  } catch (error) {
    console.error("Seed error:", error);
    toast.error("فشل إدخال البيانات التجريبية");
    return { ok: false, message: error?.message || "seed failed" };
  }
}
