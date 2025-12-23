## قاعدة البيانات للمشروع

هذا المجلد يحتوي على سكربتات SQL لبناء قاعدة بيانات **PostgreSQL** متوافقة مع واجهات الـ API المستخدمة في مشروع الواجهة الأمامية.

### طريقة الاستخدام

1. أنشئ قاعدة بيانات PostgreSQL جديدة (محليًا أو على خادم).
2. نفّذ الملفات بالترتيب العددي:
   - `001_core_users.sql`
   - `002_lookups_and_cities.sql`
   - `003_accounts.sql`
   - `004_services_requests_orders.sql`
   - `005_attachments.sql`
   - `006_ratings_tickets_notifications.sql`
   - `007_faqs_partners_customers.sql`
   - `008_payments_profile.sql`
3. حدّث متغير البيئة في مشروع React:

```env
VITE_APP_BASE_URL=http://localhost:5141/
```

> ملاحظة: يمكنك تعديل أسماء الجداول أو الحقول حسب الحاجة، لكن يجب الحفاظ على المنطق العام للعلاقات حتى تعمل الواجهات الحالية بدون تعديل كبير.


