-- Migration: Fix demo teacher and student users
-- Root cause: auth.identities rows were missing, which Supabase requires for email/password login
-- This migration uses fixed UUIDs so ON CONFLICT works correctly on re-runs

DO $$
DECLARE
    teacher_uuid UUID := '11111111-1111-1111-1111-111111111111';
    student_uuid UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- -------------------------------------------------------
    -- 1. Remove any existing partial records for these emails
    --    (cleanup in case previous migration left orphaned rows)
    -- -------------------------------------------------------
    DELETE FROM public.user_profiles
    WHERE email IN ('teacher@eduai.com', 'student@eduai.com');

    DELETE FROM auth.identities
    WHERE provider_id IN ('teacher@eduai.com', 'student@eduai.com')
      AND provider = 'email';

    DELETE FROM auth.users
    WHERE email IN ('teacher@eduai.com', 'student@eduai.com');

    -- -------------------------------------------------------
    -- 2. Insert demo TEACHER into auth.users
    -- -------------------------------------------------------
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        teacher_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'teacher@eduai.com',
        crypt('teacher123', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        jsonb_build_object('full_name', 'Demo Teacher', 'role', 'teacher'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (id) DO UPDATE
        SET encrypted_password = crypt('teacher123', gen_salt('bf', 10)),
            email_confirmed_at = now(),
            raw_user_meta_data = jsonb_build_object('full_name', 'Demo Teacher', 'role', 'teacher'),
            updated_at = now();

    -- -------------------------------------------------------
    -- 3. Insert demo STUDENT into auth.users
    -- -------------------------------------------------------
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        student_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'student@eduai.com',
        crypt('student123', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        jsonb_build_object('full_name', 'Demo Student', 'role', 'student'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (id) DO UPDATE
        SET encrypted_password = crypt('student123', gen_salt('bf', 10)),
            email_confirmed_at = now(),
            raw_user_meta_data = jsonb_build_object('full_name', 'Demo Student', 'role', 'student'),
            updated_at = now();

    -- -------------------------------------------------------
    -- 4. Insert auth.identities for TEACHER (required for email/password login)
    -- -------------------------------------------------------
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        teacher_uuid,
        teacher_uuid,
        'teacher@eduai.com',
        'email',
        jsonb_build_object(
            'sub', teacher_uuid::TEXT,
            'email', 'teacher@eduai.com',
            'email_verified', true,
            'provider', 'email'
        ),
        now(),
        now(),
        now()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE
        SET identity_data = jsonb_build_object(
                'sub', teacher_uuid::TEXT,
                'email', 'teacher@eduai.com',
                'email_verified', true,
                'provider', 'email'
            ),
            updated_at = now();

    -- -------------------------------------------------------
    -- 5. Insert auth.identities for STUDENT (required for email/password login)
    -- -------------------------------------------------------
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        student_uuid,
        student_uuid,
        'student@eduai.com',
        'email',
        jsonb_build_object(
            'sub', student_uuid::TEXT,
            'email', 'student@eduai.com',
            'email_verified', true,
            'provider', 'email'
        ),
        now(),
        now(),
        now()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE
        SET identity_data = jsonb_build_object(
                'sub', student_uuid::TEXT,
                'email', 'student@eduai.com',
                'email_verified', true,
                'provider', 'email'
            ),
            updated_at = now();

    -- -------------------------------------------------------
    -- 6. Ensure user_profiles rows exist with correct roles
    -- -------------------------------------------------------
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES
        (teacher_uuid, 'teacher@eduai.com', 'Demo Teacher', 'teacher'),
        (student_uuid, 'student@eduai.com', 'Demo Student', 'student')
    ON CONFLICT (id) DO UPDATE
        SET role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo user fix failed: %', SQLERRM;
END $$;
