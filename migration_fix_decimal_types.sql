-- =====================================================
-- MIGRATION: Convert All Money Columns to NUMERIC
-- This allows decimal values like 2.5, 10.75, etc.
-- Run this to fix "invalid input syntax for type integer" errors
-- =====================================================

-- TUSSLES TABLE - Convert price columns
ALTER TABLE tussles
ALTER COLUMN sell_price TYPE NUMERIC(12,2),
ALTER COLUMN cost_price TYPE NUMERIC(12,2);

-- Add quantity and price_per_piece if they don't exist
ALTER TABLE tussles
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS price_per_piece NUMERIC(10,2) DEFAULT 0;

-- RECEIPTS TABLE - Convert amount columns
ALTER TABLE receipts
ALTER COLUMN total_amount TYPE NUMERIC(12,2);

-- EXPENSE ALLOCATIONS TABLE - Convert amount columns
ALTER TABLE expense_allocations
ALTER COLUMN allocated_amount TYPE NUMERIC(12,2);

-- WORK ASSIGNMENTS TABLE - Convert payment columns
-- Must drop generated column FIRST before altering rate column
ALTER TABLE work_assignments
DROP COLUMN IF EXISTS total_pay;

-- Now we can safely alter the rate column type
ALTER TABLE work_assignments
ALTER COLUMN rate TYPE NUMERIC(10,2);

-- Recreate total_pay as a generated column with NUMERIC type
ALTER TABLE work_assignments
ADD COLUMN total_pay NUMERIC(12,2) GENERATED ALWAYS AS (quantity * rate) STORED;

-- PROFILES TABLE - Convert salary column
ALTER TABLE profiles
ALTER COLUMN salary TYPE NUMERIC(12,2);

-- COMPANIES TABLE - Convert spent column
ALTER TABLE companies
ALTER COLUMN total_spent TYPE NUMERIC(12,2);

-- Update existing records to set default values for new columns
UPDATE tussles
SET price_per_piece = sell_price,
    quantity = 1
WHERE price_per_piece = 0 OR price_per_piece IS NULL;

-- =====================================================
-- SUMMARY OF CHANGES:
-- =====================================================
-- All money/price columns now use NUMERIC(x,2)
-- This allows values like: 2.5, 10.75, 999.99, etc.
-- 
-- NUMERIC(10,2) = up to 8 digits before decimal, 2 after (e.g., 12345678.99)
-- NUMERIC(12,2) = up to 10 digits before decimal, 2 after (e.g., 1234567890.99)
-- =====================================================
