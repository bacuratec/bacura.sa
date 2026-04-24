-- Ensure all required entity types exist
DO $$
DECLARE
    p_type_id INT;
    r_type_id INT;
BEGIN
    SELECT id INTO p_type_id FROM lookup_types WHERE code = 'provider-entity-types';
    SELECT id INTO r_type_id FROM lookup_types WHERE code = 'requester-entity-types';

    -- Provider Types
    IF p_type_id IS NOT NULL THEN
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES 
            (p_type_id, 'company', 'شركة', 'Company'),
            (p_type_id, 'establishment', 'مؤسسة', 'Establishment'),
            (p_type_id, 'individual', 'فرد', 'Individual')
        ON CONFLICT (lookup_type_id, code) DO UPDATE SET
            name_ar = EXCLUDED.name_ar,
            name_en = EXCLUDED.name_en;
    END IF;

    -- Requester Types
    IF r_type_id IS NOT NULL THEN
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES 
            (r_type_id, 'company', 'شركة', 'Company'),
            (r_type_id, 'establishment', 'مؤسسة', 'Establishment'),
            (r_type_id, 'individual', 'فرد', 'Individual')
        ON CONFLICT (lookup_type_id, code) DO UPDATE SET
            name_ar = EXCLUDED.name_ar,
            name_en = EXCLUDED.name_en;
    END IF;
END $$;

-- Ensure comprehensive list of Saudi cities
INSERT INTO cities (id, name_ar, name_en)
VALUES
    (1, 'الرياض', 'Riyadh'),
    (2, 'جدة', 'Jeddah'),
    (3, 'مكة المكرمة', 'Makkah'),
    (4, 'المدينة المنورة', 'Madinah'),
    (5, 'الدمام', 'Dammam'),
    (6, 'الخبر', 'Khobar'),
    (7, 'الظهران', 'Dhahran'),
    (8, 'الأحساء', 'Ahsa'),
    (9, 'الطائف', 'Taif'),
    (10, 'بريدة', 'Buraydah'),
    (11, 'تبوك', 'Tabuk'),
    (12, 'أبها', 'Abha'),
    (13, 'خميس مشيط', 'Khamis Mushait'),
    (14, 'حائل', 'Hail'),
    (15, 'نجران', 'Najran'),
    (16, 'جيزان', 'Jizan'),
    (17, 'القريات', 'Gurayat'),
    (18, 'سكاكا', 'Sakaka'),
    (19, 'ينبع', 'Yanbu'),
    (20, 'الجبيل', 'Jubail'),
    (21, 'الخرج', 'Kharj'),
    (22, 'القطيف', 'Qatif'),
    (23, 'عرعر', 'Arar'),
    (24, 'عنيزة', 'Unaizah'),
    (25, 'حفر الباطن', 'Hafar Al-Batin'),
    (26, 'الرس', 'Ar Rass'),
    (27, 'محايل عسير', 'Muhayil'),
    (28, 'بيشة', 'Bisha'),
    (29, 'الباحة', 'Al Bahah'),
    (30, 'القنفذة', 'Al Qunfudhah')
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en;

-- Adjust sequence to avoid conflicts with manual ID inserts
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));
