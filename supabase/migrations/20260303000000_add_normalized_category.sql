ALTER TABLE reaper_products ADD COLUMN IF NOT EXISTS normalized_category TEXT;
CREATE INDEX IF NOT EXISTS idx_reaper_products_normalized_category ON reaper_products(normalized_category);
