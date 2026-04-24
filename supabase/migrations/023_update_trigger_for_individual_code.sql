-- Update handle_new_user_v3 to support the new 'individual' code for providers
CREATE OR REPLACE FUNCTION public.handle_new_user_v3()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_entity_type_id INT;
    v_city_id INT;
    v_phone TEXT;
    v_cr_number TEXT;
    v_specialization TEXT;
    v_bio TEXT;
BEGIN
    -- Data extraction from raw_user_meta_data
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'Requester');
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'fullName',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', new.phone);
    v_cr_number := new.raw_user_meta_data->>'commercialRecord';
    v_specialization := new.raw_user_meta_data->>'specialization';
    v_bio := new.raw_user_meta_data->>'bio';
    
    -- Safe ID casting
    BEGIN v_entity_type_id := (new.raw_user_meta_data->>'entityTypeId')::INT; EXCEPTION WHEN OTHERS THEN v_entity_type_id := NULL; END;
    BEGIN v_city_id := (new.raw_user_meta_data->>'regionId')::INT; EXCEPTION WHEN OTHERS THEN v_city_id := NULL; END;

    -- Handle Fallbacks with the new 'individual' code
    IF v_entity_type_id IS NULL THEN
        IF v_role ILIKE 'Requester' THEN
            SELECT id INTO v_entity_type_id FROM public.lookup_values 
            WHERE code = 'individual' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'requester-entity-types')
            LIMIT 1;
        ELSE
            SELECT id INTO v_entity_type_id FROM public.lookup_values 
            WHERE code = 'individual' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'provider-entity-types')
            LIMIT 1;
        END IF;
    END IF;

    -- Final fallback if still null
    IF v_entity_type_id IS NULL THEN
         -- Attempt to find ANY individual/individual-like type
         SELECT id INTO v_entity_type_id FROM public.lookup_values WHERE code IN ('individual', 'freelancer') LIMIT 1;
    END IF;

    -- A. Sync into public.users
    INSERT INTO public.users (id, email, phone, role, created_at, updated_at)
    VALUES (new.id, new.email, v_phone, v_role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        role = EXCLUDED.role,
        updated_at = NOW();

    -- B. Handle specific roles
    IF v_role ILIKE 'Requester' THEN
        INSERT INTO public.requesters (user_id, name, entity_type_id, city_id, commercial_reg_no, created_at, updated_at)
        VALUES (new.id, v_full_name, v_entity_type_id, v_city_id, v_cr_number, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            entity_type_id = EXCLUDED.entity_type_id,
            city_id = EXCLUDED.city_id,
            commercial_reg_no = EXCLUDED.commercial_reg_no,
            updated_at = NOW();

    ELSIF v_role ILIKE 'Provider' THEN
        INSERT INTO public.providers (user_id, name, entity_type_id, city_id, specialization, created_at, updated_at, profile_status_id)
        VALUES (new.id, v_full_name, v_entity_type_id, v_city_id, v_specialization, NOW(), NOW(), 201)
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            entity_type_id = EXCLUDED.entity_type_id,
            city_id = EXCLUDED.city_id,
            specialization = EXCLUDED.specialization,
            updated_at = NOW();

    ELSIF v_role ILIKE 'Admin' THEN
        INSERT INTO public.admins (user_id, display_name, created_at, updated_at)
        VALUES (new.id, v_full_name, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            updated_at = NOW();
    END IF;

    -- C. Handle profile_infos
    INSERT INTO public.profile_infos (user_id, bio, created_at, updated_at)
    VALUES (new.id, v_bio, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        bio = COALESCE(EXCLUDED.bio, public.profile_infos.bio),
        updated_at = NOW();

    -- D. Handle notification_preferences
    INSERT INTO public.notification_preferences (user_id, email_enabled, order_updates, billing_updates, security_alerts, marketing, updated_at)
    VALUES (new.id, TRUE, TRUE, TRUE, TRUE, FALSE, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;
