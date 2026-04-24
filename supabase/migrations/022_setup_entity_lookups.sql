-- Ensure lookup types exist for entity types
INSERT INTO lookup_types (code, name_ar, name_en)
VALUES 
    ('provider-entity-types', 'أنواع كيان مزود الخدمة', 'Provider Entity Types'),
    ('requester-entity-types', 'أنواع كيان طالب الخدمة', 'Requester Entity Types')
ON CONFLICT (code) DO NOTHING;

-- Get the IDs
DO $$
DECLARE
    p_type_id INT;
    r_type_id INT;
BEGIN
    SELECT id INTO p_type_id FROM lookup_types WHERE code = 'provider-entity-types';
    SELECT id INTO r_type_id FROM lookup_types WHERE code = 'requester-entity-types';

    -- Provider Types (Individual, Establishment, Company)
    INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
    VALUES 
        (p_type_id, 'individual', 'فرد', 'Individual'),
        (p_type_id, 'establishment', 'مؤسسة', 'Establishment'),
        (p_type_id, 'company', 'شركة', 'Company')
    ON CONFLICT (lookup_type_id, code) DO UPDATE SET
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en;

    -- Requester Types (Individual, Establishment, Company)
    INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
    VALUES 
        (r_type_id, 'individual', 'فرد', 'Individual'),
        (r_type_id, 'establishment', 'مؤسسة', 'Establishment'),
        (r_type_id, 'company', 'شركة', 'Company')
    ON CONFLICT (lookup_type_id, code) DO UPDATE SET
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en;
END $$;
