-- Migration: Add demo teacher and student users for testing
-- Creates working demo accounts that match the credentials shown on login pages

DO $$
DECLARE
    teacher_uuid UUID := gen_random_uuid();
    student_uuid UUID := gen_random_uuid();
BEGIN
    -- Insert demo teacher user into auth.users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        teacher_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'teacher@eduai.com', crypt('teacher123', gen_salt('bf', 10)), now(), now(), now(),
        jsonb_build_object('full_name', 'Demo Teacher', 'role', 'teacher'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (email) DO NOTHING;

    -- Insert demo student user into auth.users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        student_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'student@eduai.com', crypt('student123', gen_salt('bf', 10)), now(), now(), now(),
        jsonb_build_object('full_name', 'Demo Student', 'role', 'student'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (email) DO NOTHING;

    -- Ensure user_profiles rows exist for demo users (in case trigger did not fire)
    INSERT INTO public.user_profiles (id, email, full_name, role)
    SELECT id, email,
        COALESCE(raw_user_meta_data->>'full_name', ''),
        COALESCE(raw_user_meta_data->>'role', 'student')
    FROM auth.users
    WHERE email IN ('teacher@eduai.com', 'student@eduai.com')
    ON CONFLICT (id) DO UPDATE
        SET role = EXCLUDED.role,
            full_name = EXCLUDED.full_name;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo user insertion skipped: %', SQLERRM;
END $$;
