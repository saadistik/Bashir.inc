-- =====================================================
-- BASHIR.INC MANUFACTURING ERP DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'employee')),
  salary INTEGER DEFAULT 0,
  id_card TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Companies Table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tussles Table
CREATE TABLE tussles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  sell_price INTEGER NOT NULL DEFAULT 0,
  cost_price INTEGER DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Receipts Table
CREATE TABLE receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT,
  total_amount INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Expense Allocations Table
CREATE TABLE expense_allocations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
  tussle_id UUID REFERENCES tussles(id) ON DELETE CASCADE NOT NULL,
  allocated_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workers Table
CREATE TABLE workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Work Assignments Table
CREATE TABLE work_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tussle_id UUID REFERENCES tussles(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  rate INTEGER NOT NULL DEFAULT 0,
  total_pay INTEGER GENERATED ALWAYS AS (quantity * rate) STORED,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Calendar Events Table
CREATE TABLE calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tussles_company_id ON tussles(company_id);
CREATE INDEX idx_tussles_status ON tussles(status);
CREATE INDEX idx_tussles_due_date ON tussles(due_date);
CREATE INDEX idx_expense_allocations_tussle_id ON expense_allocations(tussle_id);
CREATE INDEX idx_expense_allocations_receipt_id ON expense_allocations(receipt_id);
CREATE INDEX idx_work_assignments_tussle_id ON work_assignments(tussle_id);
CREATE INDEX idx_work_assignments_worker_id ON work_assignments(worker_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role, salary)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE((NEW.raw_user_meta_data->>'salary')::INTEGER, 0)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tussles_updated_at BEFORE UPDATE ON tussles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_assignments_updated_at BEFORE UPDATE ON work_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tussles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owners can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Companies Policies
CREATE POLICY "Anyone can view companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert companies" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update companies" ON companies
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Tussles Policies
CREATE POLICY "Anyone can view tussles" ON tussles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tussles" ON tussles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tussles" ON tussles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tussles" ON tussles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Receipts Policies
CREATE POLICY "Anyone can view receipts" ON receipts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert receipts" ON receipts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Expense Allocations Policies
CREATE POLICY "Anyone can view expense allocations" ON expense_allocations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert expense allocations" ON expense_allocations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete expense allocations" ON expense_allocations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Workers Policies
CREATE POLICY "Anyone can view workers" ON workers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert workers" ON workers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update workers" ON workers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Work Assignments Policies
CREATE POLICY "Anyone can view work assignments" ON work_assignments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert work assignments" ON work_assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update work assignments" ON work_assignments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete work assignments" ON work_assignments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Calendar Events Policies
CREATE POLICY "Anyone can view calendar events" ON calendar_events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update calendar events" ON calendar_events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete calendar events" ON calendar_events
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Note: Users must be created via Supabase Auth API first
-- The following data assumes users have been created with these credentials:
-- Owner: username=owner, email=owner@bashir.inc, password=bashir123
-- Employee: username=ali, email=ali@bashir.inc, password=bashir123

-- Insert Companies
INSERT INTO companies (id, name, logo_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sapphire Textiles', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Emerald Fabrics', NULL);

-- Insert Tussles
INSERT INTO tussles (id, company_id, name, image_url, status, sell_price, due_date) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Red Velvet Tussle',
    NULL,
    'pending',
    50000,
    CURRENT_DATE + INTERVAL '14 days'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Gold Beaded',
    NULL,
    'pending',
    40000,
    CURRENT_DATE + INTERVAL '21 days'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Silk Green Tussle',
    NULL,
    'completed',
    60000,
    CURRENT_DATE - INTERVAL '7 days'
  );

-- Insert Workers
INSERT INTO workers (id, name, specialty, phone) VALUES
  (
    '66666666-6666-6666-6666-666666666666',
    'Samina Bibi',
    'Beading',
    '+92-300-1234567'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Rafiq Ahmed',
    'Thread Work',
    '+92-301-7654321'
  );

-- Insert Work Assignments
INSERT INTO work_assignments (tussle_id, worker_id, quantity, rate, due_date, status) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    50,
    50,
    CURRENT_DATE + INTERVAL '10 days',
    'pending'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '77777777-7777-7777-7777-777777777777',
    200,
    30,
    CURRENT_DATE - INTERVAL '7 days',
    'completed'
  );

-- Insert Sample Receipts
INSERT INTO receipts (id, total_amount, uploaded_at) VALUES
  (
    '88888888-8888-8888-8888-888888888888',
    10000,
    CURRENT_DATE - INTERVAL '5 days'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    15000,
    CURRENT_DATE - INTERVAL '3 days'
  );

-- Insert Expense Allocations
INSERT INTO expense_allocations (receipt_id, tussle_id, allocated_amount) VALUES
  (
    '88888888-8888-8888-8888-888888888888',
    '33333333-3333-3333-3333-333333333333',
    5000
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '55555555-5555-5555-5555-555555555555',
    8000
  );

-- Insert Sample Calendar Events
INSERT INTO calendar_events (title, date, type) VALUES
  ('Client Meeting - Sapphire', CURRENT_DATE + INTERVAL '3 days', 'meeting'),
  ('Delivery Deadline - Red Velvet', CURRENT_DATE + INTERVAL '14 days', 'deadline'),
  ('Factory Maintenance', CURRENT_DATE + INTERVAL '7 days', 'maintenance');

-- =====================================================
-- MANUAL USER SETUP INSTRUCTIONS
-- =====================================================

-- After running this schema, you need to manually create users via Supabase Dashboard or API:
--
-- 1. Owner Account:
--    - Email: owner@bashir.inc
--    - Password: bashir123
--    - Then update the profile:
--      UPDATE profiles SET username = 'owner', full_name = 'Business Owner', role = 'owner', salary = 0
--      WHERE id = '[owner_user_id]';
--
-- 2. Employee Account:
--    - Email: ali@bashir.inc
--    - Password: bashir123
--    - Then update the profile:
--      UPDATE profiles SET username = 'ali', full_name = 'Ali Khan', role = 'employee', salary = 50000
--      WHERE id = '[employee_user_id]';

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- View all users with profiles
-- SELECT u.id, u.email, p.username, p.full_name, p.role, p.salary
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.id;

-- Calculate total profit
-- SELECT 
--   SUM(t.sell_price) as total_revenue,
--   SUM(ea.allocated_amount) as material_costs,
--   SUM(wa.total_pay) as labor_costs,
--   SUM(p.salary) as employee_salaries,
--   SUM(t.sell_price) - SUM(ea.allocated_amount) - SUM(wa.total_pay) - SUM(p.salary) as net_profit
-- FROM tussles t
-- LEFT JOIN expense_allocations ea ON t.id = ea.tussle_id
-- LEFT JOIN work_assignments wa ON t.id = wa.tussle_id
-- CROSS JOIN (SELECT SUM(salary) as salary FROM profiles WHERE role = 'employee') p;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
