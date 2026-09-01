-- Migration: Add role column to user_profiles
-- Adds teacher/student role support

-- 1. Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN role TEXT NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'teacher'));
    END IF;
END $$;

-- 2. Update handle_new_user trigger to include role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
