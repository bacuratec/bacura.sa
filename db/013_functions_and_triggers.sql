-- 013_functions_and_triggers.sql
-- الدوال (Functions) والـ Triggers للعمليات التلقائية

-- ============================================
-- دالة لتحديث updated_at تلقائياً
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- دالة لحساب متوسط التقييمات لمزود الخدمة
-- ============================================
CREATE OR REPLACE FUNCTION calculate_provider_avg_rate(provider_uuid UUID)
RETURNS NUMERIC(3,2) AS $$
DECLARE
    avg_rating NUMERIC(3,2);
BEGIN
    SELECT COALESCE(AVG(rating_value), 0)::NUMERIC(3,2)
    INTO avg_rating
    FROM order_ratings
    JOIN orders ON order_ratings.order_id = orders.id
    WHERE orders.provider_id = provider_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- دالة لجلب role المستخدم (للاستخدام في LoginForm)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    -- أولاً: جلب role من جدول users
    SELECT role INTO user_role
    FROM users
    WHERE id = user_uuid;
    
    -- إذا لم نجد role في users، نبحث في الجداول الأخرى
    IF user_role IS NULL OR user_role = '' THEN
        -- التحقق من admins
        IF EXISTS (SELECT 1 FROM admins WHERE user_id = user_uuid OR id = user_uuid) THEN
            RETURN 'Admin';
        END IF;
        
        -- التحقق من providers
        IF EXISTS (SELECT 1 FROM providers WHERE user_id = user_uuid OR id = user_uuid) THEN
            RETURN 'Provider';
        END IF;
        
        -- التحقق من requesters
        IF EXISTS (SELECT 1 FROM requesters WHERE user_id = user_uuid OR id = user_uuid) THEN
            RETURN 'Requester';
        END IF;
    END IF;
    
    RETURN COALESCE(user_role, 'Requester');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- دالة لتحديث avg_rate تلقائياً عند إضافة تقييم
-- ============================================
CREATE OR REPLACE FUNCTION update_provider_avg_rate()
RETURNS TRIGGER AS $$
DECLARE
    provider_uuid UUID;
BEGIN
    -- جلب provider_id من order
    SELECT provider_id INTO provider_uuid
    FROM orders
    WHERE id = NEW.order_id;
    
    -- تحديث avg_rate
    IF provider_uuid IS NOT NULL THEN
        UPDATE providers
        SET avg_rate = calculate_provider_avg_rate(provider_uuid)
        WHERE id = provider_uuid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- دالة لإنشاء إشعار عند تغيير حالة الطلب
-- ============================================
CREATE OR REPLACE FUNCTION create_order_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    requester_uuid UUID;
    provider_uuid UUID;
    order_title VARCHAR(255);
BEGIN
    -- جلب معلومات الطلب
    SELECT 
        r.requester_id,
        o.provider_id,
        o.order_title
    INTO requester_uuid, provider_uuid, order_title
    FROM orders o
    JOIN requests r ON o.request_id = r.id
    WHERE o.id = NEW.id;
    
    -- إنشاء إشعار للمستخدم المناسب حسب التغيير
    IF OLD.order_status_id != NEW.order_status_id THEN
        -- إشعار لطالب الخدمة
        IF requester_uuid IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, body)
            VALUES (
                requester_uuid,
                'تحديث حالة الطلب',
                'تم تحديث حالة الطلب: ' || COALESCE(order_title, 'طلبك')
            );
        END IF;
        
        -- إشعار لمزود الخدمة
        IF provider_uuid IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, body)
            VALUES (
                provider_uuid,
                'تحديث حالة المشروع',
                'تم تحديث حالة المشروع: ' || COALESCE(order_title, 'مشروعك')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers لتحديث updated_at تلقائياً
-- ============================================
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_requesters_updated_at
    BEFORE UPDATE ON requesters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profile_infos_updated_at
    BEFORE UPDATE ON profile_infos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_faq_questions_updated_at
    BEFORE UPDATE ON faq_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger لتحديث avg_rate عند إضافة/تحديث تقييم
-- ============================================
CREATE TRIGGER trigger_update_provider_avg_rate
    AFTER INSERT OR UPDATE ON order_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_avg_rate();

-- ============================================
-- Trigger لإنشاء إشعارات عند تغيير حالة الطلب
-- ============================================
CREATE TRIGGER trigger_create_order_status_notification
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.order_status_id IS DISTINCT FROM NEW.order_status_id)
    EXECUTE FUNCTION create_order_status_notification();

-- ============================================
-- دالة للتحقق من صحة التواريخ في orders
-- ============================================
CREATE OR REPLACE FUNCTION validate_order_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- التحقق من أن due_date بعد start_date
    IF NEW.start_date IS NOT NULL AND NEW.due_date IS NOT NULL THEN
        IF NEW.due_date < NEW.start_date THEN
            RAISE EXCEPTION 'due_date يجب أن يكون بعد start_date';
        END IF;
    END IF;
    
    -- التحقق من أن completed_at بعد start_date
    IF NEW.completed_at IS NOT NULL AND NEW.start_date IS NOT NULL THEN
        IF NEW.completed_at < NEW.start_date THEN
            RAISE EXCEPTION 'completed_at يجب أن يكون بعد start_date';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_order_dates
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_dates();

