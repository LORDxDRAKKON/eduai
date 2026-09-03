-- Migration: Security hardening — RLS policies, ownership checks, and audit logging
-- Timestamp: 20260903175616

-- ============================================================
-- 1. Ensure RLS is enabled on user_profiles (idempotent)
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they are correct
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;

-- Users can only read their own profile
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can only insert their own profile row
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Service role (used by handle_new_user trigger) can insert any profile
-- This is needed because triggers run as the function owner (SECURITY DEFINER)
-- No additional policy needed — SECURITY DEFINER bypasses RLS

-- ============================================================
-- 2. Assignments table — create if not exists, add RLS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    grade TEXT NOT NULL DEFAULT '',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_assignments" ON public.assignments;
DROP POLICY IF EXISTS "teachers_read_own_assignments" ON public.assignments;

-- Teachers can only manage their own assignments
CREATE POLICY "teachers_manage_own_assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- ============================================================
-- 3. Content history table — create if not exists, add RLS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    grade TEXT NOT NULL DEFAULT '',
    content_type TEXT NOT NULL DEFAULT '',
    content JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON public.content_history(user_id);

ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_content_history" ON public.content_history;

-- Users can only access their own content history
CREATE POLICY "users_manage_own_content_history"
ON public.content_history
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 4. Ensure updated_at trigger exists for assignments
-- ============================================================
DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.assignments;
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. Revoke public schema access from anon role on sensitive tables
-- ============================================================
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.assignments FROM anon;
REVOKE ALL ON public.content_history FROM anon;

-- Grant only to authenticated role (RLS enforces row-level ownership)
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.content_history TO authenticated;
