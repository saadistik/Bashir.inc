-- =====================================================
-- BASHIR.INC COMPLETE DATABASE SETUP (USERNAME LOGIN ONLY)
-- =====================================================
-- This script is for a fresh database. Paste once in Supabase SQL Editor.
-- Auth users/email signup are NOT used by this app.
-- Login is handled by public.login_user(username, password).

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CLEANUP (SAFE FOR RE-RUNS)
-- =====================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_tussles_updated_at ON public.tussles;
DROP TRIGGER IF EXISTS update_workers_updated_at ON public.workers;
DROP TRIGGER IF EXISTS update_work_assignments_updated_at ON public.work_assignments;
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.login_user(text, text);

DROP TABLE IF EXISTS public.expense_allocations CASCADE;
DROP TABLE IF EXISTS public.work_assignments CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.tussles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  salary NUMERIC(12,2) DEFAULT 0,
  id_card TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  total_spent NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.tussles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_per_piece NUMERIC(10,2) NOT NULL DEFAULT 0,
  sell_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.expense_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  tussle_id UUID NOT NULL REFERENCES public.tussles(id) ON DELETE CASCADE,
  allocated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.work_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tussle_id UUID NOT NULL REFERENCES public.tussles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_pay NUMERIC(12,2) GENERATED ALWAYS AS ((quantity::numeric * rate)) STORED,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Kept for backward compatibility with previous schema.
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_tussles_company_id ON public.tussles(company_id);
CREATE INDEX idx_tussles_status ON public.tussles(status);
CREATE INDEX idx_tussles_due_date ON public.tussles(due_date);
CREATE INDEX idx_expense_allocations_tussle_id ON public.expense_allocations(tussle_id);
CREATE INDEX idx_expense_allocations_receipt_id ON public.expense_allocations(receipt_id);
CREATE INDEX idx_work_assignments_tussle_id ON public.work_assignments(tussle_id);
CREATE INDEX idx_work_assignments_worker_id ON public.work_assignments(worker_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(date);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tussles_updated_at
  BEFORE UPDATE ON public.tussles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_assignments_updated_at
  BEFORE UPDATE ON public.work_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- LOGIN FUNCTION (NO SUPABASE AUTH USERS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.login_user(p_username text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT *
  INTO v_profile
  FROM public.profiles
  WHERE lower(username) = lower(trim(p_username))
    AND password_hash = extensions.crypt(p_password, password_hash)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'username', v_profile.username,
    'full_name', v_profile.full_name,
    'role', v_profile.role,
    'salary', v_profile.salary,
    'id_card', v_profile.id_card,
    'avatar_url', v_profile.avatar_url
  );
END;
$$;

REVOKE ALL ON FUNCTION public.login_user(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_user(text, text) TO anon, authenticated;

-- =====================================================
-- DISABLE RLS (APP USES ANON KEY WITH APP-LEVEL LOGIN)
-- =====================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tussles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;

-- Grants required for anon key access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- STORAGE BUCKETS AND POLICIES
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('tussle-images', 'tussle-images', true),
  ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    name = EXCLUDED.name;

DROP POLICY IF EXISTS "Public read tussle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload tussle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete tussle images" ON storage.objects;
DROP POLICY IF EXISTS "Public read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete receipts" ON storage.objects;

CREATE POLICY "Public read tussle images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tussle-images');

CREATE POLICY "Authenticated upload tussle images"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'tussle-images');

CREATE POLICY "Authenticated delete tussle images"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'tussle-images');

CREATE POLICY "Public read receipts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated upload receipts"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated delete receipts"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'receipts');

-- =====================================================
-- FIXED APP USERS
-- =====================================================

INSERT INTO public.profiles (username, password_hash, full_name, role, salary, id_card)
VALUES
  (
    'Bashir',
    extensions.crypt('Bashir@123', extensions.gen_salt('bf')),
    'Bashir',
    'admin',
    0,
    'ADM-001'
  ),
  (
    'Farhan',
    extensions.crypt('Farhan@123', extensions.gen_salt('bf')),
    'Farhan',
    'employee',
    50000,
    'EMP-001'
  );

COMMIT;

-- =====================================================
-- QUICK CHECKS
-- =====================================================
-- SELECT id, username, full_name, role FROM public.profiles ORDER BY role, username;
-- SELECT public.login_user('Bashir', 'Bashir@123');
-- SELECT public.login_user('Farhan', 'Farhan@123');
