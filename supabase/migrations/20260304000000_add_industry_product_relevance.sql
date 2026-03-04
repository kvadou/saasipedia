-- Industry Product Relevance table
-- Stores per-industry ranking and market position for products

CREATE TABLE industry_product_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES reaper_products(id) ON DELETE CASCADE,
  industry_slug TEXT NOT NULL,
  business_type_slugs TEXT[] DEFAULT '{}',
  relevance_rank INTEGER,
  market_position TEXT CHECK (market_position IN ('leader', 'challenger', 'niche')),
  industry_specific BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, industry_slug)
);

CREATE INDEX idx_ipr_industry ON industry_product_relevance(industry_slug);
CREATE INDEX idx_ipr_product ON industry_product_relevance(product_id);
CREATE INDEX idx_ipr_industry_rank ON industry_product_relevance(industry_slug, relevance_rank);
