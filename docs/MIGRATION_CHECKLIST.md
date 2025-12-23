# قائمة التحقق من التكامل مع Next.js

## ✅ المهام المكتملة

- [x] تثبيت Next.js والتبعيات المطلوبة
- [x] إنشاء ملفات إعدادات Next.js (next.config.js)
- [x] تحويل بنية المشروع من Vite إلى Next.js App Router
- [x] إعداد Redux Store ليعمل مع Next.js SSR
- [x] تحويل Layouts إلى Next.js Layouts
- [x] تحويل Routes الأساسية من React Router إلى Next.js App Router
- [x] تحويل Authentication Guards إلى Next.js middleware
- [x] تحديث ملفات الإعدادات (Tailwind, PostCSS, jsconfig.json)
- [x] إنشاء ملف .env.example
- [x] تحديث package.json scripts

## 🔄 المهام المتبقية

### صفحات Landing (Requester)
- [x] `/` - الصفحة الرئيسية
- [x] `/request-service` - طلب خدمة
- [x] `/requests` - استكشاف الطلبات
- [x] `/requests/[id]` - تفاصيل الطلب
- [x] `/projects` - المشاريع
- [x] `/projects/[id]` - تفاصيل المشروع
- [x] `/profile` - الملف الشخصي
- [x] `/profile/reviews` - التقييمات
- [ ] `/tickets` - التذاكر

### صفحات عامة
- [x] `/login` - تسجيل الدخول
- [x] `/signup` - التسجيل
- [x] `/signup-provider` - تسجيل مقدم خدمة
- [x] `/our-services` - خدماتنا
- [x] `/about-us` - من نحن
- [x] `/how-it-work` - كيف يعمل
- [x] `/faqs` - الأسئلة الشائعة
- [x] `/partners` - الشركاء

### صفحات Provider
- [x] `/provider` - الصفحة الرئيسية
- [x] `/provider/active-orders` - الطلبات النشطة
- [x] `/provider/our-projects` - مشاريعنا
- [x] `/provider/our-rates` - تقييماتنا
- [ ] `/provider/profile` - الملف الشخصي
- [ ] `/provider/tickets` - التذاكر
- [ ] `/provider/tickets/[id]` - تفاصيل التذكرة
- [ ] `/provider/projects/[id]` - تفاصيل المشروع

### صفحات Admin
- [x] `/admin` - الصفحة الرئيسية
- [ ] `/admin/providers` - مقدمي الخدمة
- [ ] `/admin/providers/[id]` - تفاصيل مقدم الخدمة
- [ ] `/admin/requesters` - طالبي الخدمة
- [ ] `/admin/requesters/[id]` - تفاصيل طالب الخدمة
- [ ] `/admin/requests` - الطلبات
- [ ] `/admin/requests/[id]` - تفاصيل الطلب
- [ ] `/admin/tickets` - التذاكر
- [ ] `/admin/tickets/[id]` - تفاصيل التذكرة
- [ ] `/admin/services` - الخدمات
- [ ] `/admin/add-service` - إضافة خدمة
- [ ] `/admin/projects` - المشاريع
- [ ] `/admin/projects/[id]` - تفاصيل المشروع
- [ ] `/admin/ratings` - التقييمات
- [ ] `/admin/faqs` - الأسئلة الشائعة
- [ ] `/admin/add-questions` - إضافة سؤال
- [ ] `/admin/update-question/[id]` - تحديث سؤال
- [ ] `/admin/partners` - الشركاء
- [ ] `/admin/add-partner` - إضافة شريك
- [ ] `/admin/update-partner/[id]` - تحديث شريك
- [ ] `/admin/customers` - العملاء
- [ ] `/admin/add-customer` - إضافة عميل
- [ ] `/admin/update-customer/[id]` - تحديث عميل
- [ ] `/admin/profile` - الملف الشخصي
- [ ] `/admin/profile-info` - معلومات الملف الشخصي

## 🔧 المهام التقنية المتبقية

### تحديث المكونات
- [ ] تحديث جميع المكونات التي تستخدم `react-router-dom`:
  - `useNavigate` → `useRouter` من `next/navigation`
  - `useLocation` → `usePathname` من `next/navigation`
  - `Link` من `react-router-dom` → `Link` من `next/link`
  - `Navigate` → `redirect` أو `useRouter().push()`

### تحديث الـ API Calls
- [ ] التحقق من أن جميع API calls تعمل بشكل صحيح
- [ ] تحديث base URLs إذا لزم الأمر
- [ ] إضافة error handling مناسب

### تحسينات الأداء
- [ ] تحويل المكونات التي لا تحتاج تفاعل إلى Server Components
- [ ] إضافة Metadata لكل صفحة (SEO)
- [ ] تحسين الصور باستخدام `next/image`
- [ ] إضافة Loading states باستخدام `loading.jsx`

### الاختبار
- [ ] اختبار جميع المسارات
- [ ] اختبار Authentication flow
- [ ] اختبار Redux state management
- [ ] اختبار i18n (الترجمة)
- [ ] اختبار RTL/LTR switching

### النشر
- [ ] تحديث إعدادات Netlify/Vercel إذا لزم الأمر
- [ ] تحديث ملفات النشر
- [ ] اختبار البناء (`npm run build`)

## 📝 ملاحظات

1. **المكونات القديمة**: المكونات في `src/components/` و `src/pages/` لا تزال موجودة ويمكن استخدامها، لكن يجب تحديثها تدريجياً

2. **المسارات الديناميكية**: في Next.js، المسارات الديناميكية تستخدم `[id]` بدلاً من `:id`، ويتم الوصول إليها عبر `params` prop

3. **Client vs Server Components**: 
   - المكونات التي تستخدم hooks أو state يجب أن تكون Client Components (`'use client'`)
   - المكونات البسيطة يمكن أن تكون Server Components (افتراضي)

4. **Environment Variables**: تم تغيير `VITE_*` إلى `NEXT_PUBLIC_*` لـ Next.js

5. **Redux**: تم إعداد Redux ليعمل مع SSR، لكن يجب التأكد من أن جميع المكونات تستخدم `useAppDispatch` و `useAppSelector` من `@/lib/redux/hooks`

