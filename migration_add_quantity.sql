-- =====================================================
-- MIGRATION: Add Quantity and Price Per Piece to Tussles
-- Run this AFTER running the main supabase_schema.sql
-- =====================================================

-- Add new columns to tussles table with NUMERIC type for decimal support
ALTER TABLE tussles
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS price_per_piece NUMERIC(10,2) DEFAULT 0;

-- Also update sell_price to support decimals
ALTER TABLE tussles
ALTER COLUMN sell_price TYPE NUMERIC(12,2);

-- Update sell_price to be generated from quantity * price_per_piece
-- Note: This requires recreating the table or manual updates for existing records

-- For existing records, calculate price_per_piece from sell_price
UPDATE tussles
SET price_per_piece = sell_price,
    quantity = 1
WHERE price_per_piece = 0;

-- Update seed data to include quantity and price_per_piece
UPDATE tussles
SET quantity = 100,
    price_per_piece = 500.00
WHERE name = 'Red Velvet Tussle';

UPDATE tussles
SET quantity = 80,
    price_per_piece = 500.00
WHERE name = 'Gold Beaded';

UPDATE tussles
SET quantity = 120,
    price_per_piece = 500.00
WHERE name = 'Silk Green Tussle';

-- =====================================================
-- NOTES:
-- - quantity: Number of pieces in the order (INTEGER)
-- - price_per_piece: Price charged per piece in PKR (NUMERIC - supports decimals like 2.5, 10.75)
-- - sell_price: Total revenue (quantity × price_per_piece) (NUMERIC - supports decimals)
-- - Profit = sell_price - material_expenses - labor_costs
-- 
-- NUMERIC(10,2) means: 10 total digits with 2 decimal places
-- Example valid values: 2.5, 10.75, 99999.99
-- =====================================================
