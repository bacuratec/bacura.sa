-- 011_seed_demo_data_simple.sql
-- بيانات تجريبية مبسطة بدون CTEs معقدة

-- مستخدمون تجريبيون
INSERT INTO users (email, phone, password_hash, role, is_blocked)
VALUES
  ('admin@example.com',      '+966500000001', 'hashed-password-admin',      'Admin',     FALSE),
  ('requester@example.com',  '+966500000002', 'hashed-password-requester',  'Requester', FALSE),
  ('provider@example.com',   '+966500000003', 'hashed-password-provider',   'Provider',  FALSE)
ON CONFLICT (email) DO NOTHING;

-- requester تجريبي
INSERT INTO requesters (user_id, entity_type_id, name, commercial_reg_no, city_id, created_at, updated_at)
SELECT
  u.id AS user_id,
  lv.id AS entity_type_id,
  'Requester Demo Company' AS name,
  'CR-123456' AS commercial_reg_no,
  c.id AS city_id,
  NOW(), NOW()
FROM users u
JOIN lookup_types lt ON lt.code = 'requester-entity-types'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'company'
JOIN cities c ON c.name_en = 'Riyadh'
WHERE u.email = 'requester@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM requesters r WHERE r.user_id = u.id
  );

-- provider تجريبي
INSERT INTO providers (user_id, entity_type_id, name, specialization, city_id, avg_rate, created_at, updated_at)
SELECT
  u.id AS user_id,
  lv.id AS entity_type_id,
  'Provider Demo Office' AS name,
  'General Consulting' AS specialization,
  c.id AS city_id,
  0 AS avg_rate,
  NOW(), NOW()
FROM users u
JOIN lookup_types lt ON lt.code = 'provider-entity-types'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'consulting-office'
JOIN cities c ON c.name_en = 'Riyadh'
WHERE u.email = 'provider@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.user_id = u.id
  );

-- admin تجريبي
INSERT INTO admins (user_id, display_name, created_at, updated_at)
SELECT
  u.id,
  'Main Admin',
  NOW(), NOW()
FROM users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM admins a WHERE a.user_id = u.id
  );

-- خدمة تجريبية
INSERT INTO services (name_ar, name_en, description, base_price, is_active)
VALUES
  ('خدمة استشارية أساسية', 'Basic Consulting Service', 'خدمة استشارية تجريبية.', 500.00, TRUE)
ON CONFLICT DO NOTHING;

-- طلب (request) تجريبي
INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id, created_at, updated_at)
SELECT
  r.id AS requester_id,
  s.id AS service_id,
  c.id AS city_id,
  'طلب استشارة تجريبي' AS title,
  'هذا الطلب تم إنشاؤه لأغراض الاختبار.' AS description,
  lv.id AS status_id,
  NOW(), NOW()
FROM requesters r
JOIN services s ON TRUE
JOIN cities c ON c.name_en = 'Riyadh'
JOIN lookup_types lt ON lt.code = 'request-status'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM requests WHERE title = 'طلب استشارة تجريبي'
)
LIMIT 1;

-- مشروع (order) تجريبي
INSERT INTO orders (request_id, provider_id, order_title, order_status_id, start_date, created_at, updated_at)
SELECT
  req.id AS request_id,
  p.id AS provider_id,
  'مشروع استشارة تجريبي' AS order_title,
  lv.id AS order_status_id,
  NOW() AS start_date,
  NOW(), NOW()
FROM requests req
JOIN providers p ON TRUE
JOIN lookup_types lt ON lt.code = 'order-status'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'in-progress'
WHERE req.title = 'طلب استشارة تجريبي'
  AND NOT EXISTS (
    SELECT 1 FROM orders WHERE order_title = 'مشروع استشارة تجريبي'
)
LIMIT 1;


