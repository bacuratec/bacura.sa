import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

if (!url || !serviceRoleKey) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

const demoServices = [
  {
    name_ar: "خدمة التصميم الهندسي",
    name_en: "Engineering Design",
    price: 2500,
    image_url:
      "https://via.placeholder.com/300x200.png?text=Engineering+Design",
    is_active: true,
  },
  {
    name_ar: "إدارة المشاريع",
    name_en: "Project Management",
    price: 0,
    image_url:
      "https://via.placeholder.com/300x200.png?text=Project+Management",
    is_active: true,
  },
  {
    name_ar: "استشارات تقنية",
    name_en: "Technical Consulting",
    price: 1200,
    image_url:
      "https://via.placeholder.com/300x200.png?text=Technical+Consulting",
    is_active: true,
  },
  {
    name_ar: "تحليل الأعمال",
    name_en: "Business Analysis",
    price: 1500,
    image_url:
      "https://via.placeholder.com/300x200.png?text=Business+Analysis",
    is_active: true,
  },
  {
    name_ar: "اختبار وضمان الجودة",
    name_en: "QA & Testing",
    price: 800,
    image_url: "https://via.placeholder.com/300x200.png?text=QA+%26+Testing",
    is_active: true,
  },
];

async function main() {
  const { count, error: countError } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });
  if (countError) {
    console.error("Count error:", countError.message);
    process.exit(1);
  }
  if (count && count > 0) {
    console.log("Services already exist, skipping seed.");
    process.exit(0);
  }

  // Try inserting; accommodate schema differences (price vs base_price)
  // Insert with name_ar, name_en, image_url, is_active, price if column exists
  const { data, error } = await supabase.from("services").insert(
    demoServices.map((s) => ({
      name_ar: s.name_ar,
      name_en: s.name_en,
      image_url: s.image_url,
      is_active: s.is_active,
      price: s.price ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  );

  if (error) {
    console.error("Seed insert error:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${data?.length || demoServices.length} services successfully.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

