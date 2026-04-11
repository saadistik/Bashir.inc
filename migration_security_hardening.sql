-- =====================================================
-- MIGRATION: Security Hardening (RLS)
-- Tightens row-level security to authenticated users only.
-- Prevents anonymous reads/writes from the public anon key.
-- =====================================================

BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tussles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop permissive policies from base schema
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can insert profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;

DROP POLICY IF EXISTS "Anyone can view tussles" ON public.tussles;
DROP POLICY IF EXISTS "Authenticated users can insert tussles" ON public.tussles;
DROP POLICY IF EXISTS "Authenticated users can update tussles" ON public.tussles;
DROP POLICY IF EXISTS "Authenticated users can delete tussles" ON public.tussles;

DROP POLICY IF EXISTS "Anyone can view receipts" ON public.receipts;
DROP POLICY IF EXISTS "Authenticated users can insert receipts" ON public.receipts;

DROP POLICY IF EXISTS "Anyone can view expense allocations" ON public.expense_allocations;
DROP POLICY IF EXISTS "Authenticated users can insert expense allocations" ON public.expense_allocations;
DROP POLICY IF EXISTS "Authenticated users can delete expense allocations" ON public.expense_allocations;

DROP POLICY IF EXISTS "Anyone can view workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can insert workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can update workers" ON public.workers;

DROP POLICY IF EXISTS "Anyone can view work assignments" ON public.work_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert work assignments" ON public.work_assignments;
DROP POLICY IF EXISTS "Authenticated users can update work assignments" ON public.work_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete work assignments" ON public.work_assignments;

DROP POLICY IF EXISTS "Anyone can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can insert calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete calendar events" ON public.calendar_events;

-- Profiles: authenticated read, own update only
CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Companies
CREATE POLICY "Authenticated can view companies"
  ON public.companies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update companies"
  ON public.companies FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete companies"
  ON public.companies FOR DELETE
  USING (auth.role() = 'authenticated');

-- Tussles
CREATE POLICY "Authenticated can view tussles"
  ON public.tussles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert tussles"
  ON public.tussles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update tussles"
  ON public.tussles FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete tussles"
  ON public.tussles FOR DELETE
  USING (auth.role() = 'authenticated');

-- Receipts
CREATE POLICY "Authenticated can view receipts"
  ON public.receipts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update receipts"
  ON public.receipts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete receipts"
  ON public.receipts FOR DELETE
  USING (auth.role() = 'authenticated');

-- Expense allocations
CREATE POLICY "Authenticated can view expense allocations"
  ON public.expense_allocations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert expense allocations"
  ON public.expense_allocations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update expense allocations"
  ON public.expense_allocations FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete expense allocations"
  ON public.expense_allocations FOR DELETE
  USING (auth.role() = 'authenticated');

-- Workers
CREATE POLICY "Authenticated can view workers"
  ON public.workers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert workers"
  ON public.workers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update workers"
  ON public.workers FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete workers"
  ON public.workers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Work assignments
CREATE POLICY "Authenticated can view work assignments"
  ON public.work_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert work assignments"
  ON public.work_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update work assignments"
  ON public.work_assignments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete work assignments"
  ON public.work_assignments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Calendar events
CREATE POLICY "Authenticated can view calendar events"
  ON public.calendar_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert calendar events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update calendar events"
  ON public.calendar_events FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete calendar events"
  ON public.calendar_events FOR DELETE
  USING (auth.role() = 'authenticated');

COMMIT;
