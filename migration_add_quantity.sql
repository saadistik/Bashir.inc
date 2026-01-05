-- =====================================================
-- MIGRATION: Add Quantity and Price Per Piece to Tussles
-- Run this AFTER running the main supabase_schema.sql
-- =====================================================

-- Add new columns to tussles table
ALTER TABLE tussles
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS price_per_piece INTEGER DEFAULT 0;

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
    price_per_piece = 500
WHERE name = 'Red Velvet Tussle';

UPDATE tussles
SET quantity = 80,
    price_per_piece = 500
WHERE name = 'Gold Beaded';

UPDATE tussles
SET quantity = 120,
    price_per_piece = 500
WHERE name = 'Silk Green Tussle';

-- =====================================================
-- NOTES:
-- - quantity: Number of pieces in the order
-- - price_per_piece: Price charged per piece (PKR)
-- - sell_price: Total revenue (quantity × price_per_piece)
-- - Profit = sell_price - material_expenses - labor_costs
-- =====================================================
