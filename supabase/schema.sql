-- ============================================================
-- Inventory Evaluation System — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'conductor' CHECK (role IN ('supervisor', 'conductor')),
  branch_id   UUID REFERENCES public.branches(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id    UUID REFERENCES public.branches(id) NOT NULL,
  conductor_id UUID REFERENCES public.profiles(id) NOT NULL,
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  -- 7 Yes/No evaluation points
  q1 BOOLEAN,
  q2 BOOLEAN,
  q3 BOOLEAN,
  q4 BOOLEAN,
  q5 BOOLEAN,
  q6 BOOLEAN,
  q7 BOOLEAN,

  -- Optional comments per question
  q1_comment TEXT,
  q2_comment TEXT,
  q3_comment TEXT,
  q4_comment TEXT,
  q5_comment TEXT,
  q6_comment TEXT,
  q7_comment TEXT
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.branches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop policies if they already exist (safe to re-run)
DROP POLICY IF EXISTS "branches_select"      ON public.branches;
DROP POLICY IF EXISTS "branches_insert"      ON public.branches;
DROP POLICY IF EXISTS "branches_update"      ON public.branches;
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "evaluations_select"   ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_insert"   ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_update"   ON public.evaluations;

-- Branches: everyone can read; only supervisors can write
CREATE POLICY "branches_select" ON public.branches FOR SELECT USING (true);
CREATE POLICY "branches_insert" ON public.branches FOR INSERT WITH CHECK (public.get_my_role() = 'supervisor');
CREATE POLICY "branches_update" ON public.branches FOR UPDATE USING (public.get_my_role() = 'supervisor');

-- Profiles: users see their own; supervisors see all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.get_my_role() = 'supervisor');
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.get_my_role() = 'supervisor');

-- Evaluations: conductors manage their own; supervisors see all
CREATE POLICY "evaluations_select" ON public.evaluations FOR SELECT USING (
  conductor_id = auth.uid() OR public.get_my_role() = 'supervisor'
);
CREATE POLICY "evaluations_insert" ON public.evaluations FOR INSERT WITH CHECK (
  conductor_id = auth.uid()
);
CREATE POLICY "evaluations_update" ON public.evaluations FOR UPDATE USING (
  (conductor_id = auth.uid() AND status = 'draft') OR public.get_my_role() = 'supervisor'
);

-- ============================================================
-- Trigger: auto-create profile on new user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'conductor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Seed: sample branches (optional — edit as needed)
-- ============================================================
INSERT INTO public.branches (name) VALUES
  ('فرعی سەنتەر'),
  ('فرعی باکوور'),
  ('فرعی باشوور')
ON CONFLICT DO NOTHING;
