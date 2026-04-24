import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadDotEnvFallback() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (key) process.env[key] = value;
      }
    }
  } catch { /* ignore */ }
}

loadDotEnvFallback();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  console.log("🚀 Starting data migration script...");

  // 1. Cities Migration
  const cities = [
    { id: 1, name_ar: 'الرياض', name_en: 'Riyadh' },
    { id: 2, name_ar: 'جدة', name_en: 'Jeddah' },
    { id: 3, name_ar: 'مكة المكرمة', name_en: 'Makkah' },
    { id: 4, name_ar: 'المدينة المنورة', name_en: 'Madinah' },
    { id: 5, name_ar: 'الدمام', name_en: 'Dammam' },
    { id: 6, name_ar: 'الخبر', name_en: 'Khobar' },
    { id: 7, name_ar: 'الظهران', name_en: 'Dhahran' },
    { id: 8, name_ar: 'الأحساء', name_en: 'Ahsa' },
    { id: 9, name_ar: 'الطائف', name_en: 'Taif' },
    { id: 10, name_ar: 'بريدة', name_en: 'Buraydah' },
    { id: 11, name_ar: 'تبوك', name_en: 'Tabuk' },
    { id: 12, name_ar: 'أبها', name_en: 'Abha' },
    { id: 13, name_ar: 'خميس مشيط', name_en: 'Khamis Mushait' },
    { id: 14, name_ar: 'حائل', name_en: 'Hail' },
    { id: 15, name_ar: 'نجران', name_en: 'Najran' },
    { id: 16, name_ar: 'جيزان', name_en: 'Jizan' },
    { id: 17, name_ar: 'القريات', name_en: 'Gurayat' },
    { id: 18, name_ar: 'سكاكا', name_en: 'Sakaka' },
    { id: 19, name_ar: 'ينبع', name_en: 'Yanbu' },
    { id: 20, name_ar: 'الجبيل', name_en: 'Jubail' },
    { id: 21, name_ar: 'الخرج', name_en: 'Kharj' },
    { id: 22, name_ar: 'القطيف', name_en: 'Qatif' },
    { id: 23, name_ar: 'عرعر', name_en: 'Arar' },
    { id: 24, name_ar: 'عنيزة', name_en: 'Unaizah' },
    { id: 25, name_ar: 'حفر الباطن', name_en: 'Hafar Al-Batin' },
    { id: 26, name_ar: 'الرس', name_en: 'Ar Rass' },
    { id: 27, name_ar: 'محايل عسير', name_en: 'Muhayil' },
    { id: 28, name_ar: 'بيشة', name_en: 'Bisha' },
    { id: 29, name_ar: 'الباحة', name_en: 'Al Bahah' },
    { id: 30, name_ar: 'القنفذة', name_en: 'Al Qunfudhah' }
  ];

  console.log("Upserting 30 cities...");
  const { error: citiesErr } = await supabase.from('cities').upsert(cities, { onConflict: 'id' });
  if (citiesErr) console.error("Error upserting cities:", citiesErr.message);
  else console.log("✅ Cities updated successfully.");

  // 2. Lookup Types
  const lookupTypes = [
    { code: 'provider-entity-types', name_ar: 'أنواع كيان مزود الخدمة', name_en: 'Provider Entity Types' },
    { code: 'requester-entity-types', name_ar: 'أنواع كيان طالب الخدمة', name_en: 'Requester Entity Types' }
  ];

  console.log("Upserting lookup types...");
  const { data: typesData, error: typesErr } = await supabase.from('lookup_types').upsert(lookupTypes, { onConflict: 'code' }).select();
  if (typesErr) {
    console.error("Error upserting lookup types:", typesErr.message);
    return;
  }
  console.log("✅ Lookup types updated successfully.");

  const pTypeId = typesData.find(t => t.code === 'provider-entity-types')?.id;
  const rTypeId = typesData.find(t => t.code === 'requester-entity-types')?.id;

  if (pTypeId && rTypeId) {
    const lookupValues = [
      { lookup_type_id: pTypeId, code: 'individual', name_ar: 'فرد', name_en: 'Individual' },
      { lookup_type_id: pTypeId, code: 'establishment', name_ar: 'مؤسسة', name_en: 'Establishment' },
      { lookup_type_id: pTypeId, code: 'company', name_ar: 'شركة', name_en: 'Company' },
      { lookup_type_id: rTypeId, code: 'individual', name_ar: 'فرد', name_en: 'Individual' },
      { lookup_type_id: rTypeId, code: 'establishment', name_ar: 'مؤسسة', name_en: 'Establishment' },
      { lookup_type_id: rTypeId, code: 'company', name_ar: 'شركة', name_en: 'Company' }
    ];

    console.log("Upserting lookup values...");
    const { error: valuesErr } = await supabase.from('lookup_values').upsert(lookupValues, { onConflict: 'lookup_type_id,code' });
    if (valuesErr) console.error("Error upserting lookup values:", valuesErr.message);
    else console.log("✅ Lookup values for entities updated successfully.");
  }

  console.log("\n⚠️ IMPORTANT: DDL operations (like CREATE FUNCTION or TRIGGER) cannot be run via this JS client.");
  console.log("Please run the SQL for the 'trigger update' in the Supabase Dashboard SQL Editor manually.");
}

main().catch(console.error);
