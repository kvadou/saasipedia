import { supabase } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  url: string | null;
  category: string | null;
  normalized_category: string | null;
  tagline: string | null;
  description: string | null;
  feature_count: number;
  quality_score: number;
  is_active: boolean;
  source: string | null;
  created_at: string;
  last_scraped_at: string | null;
}

export interface Feature {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_ai_powered: boolean;
  is_premium: boolean;
  source_url: string | null;
}

export interface PricingTier {
  id: string;
  product_id: string;
  name: string;
  price_monthly: number | null;
  price_annual: number | null;
  price_label: string | null;
  features: string[] | null;
  is_popular: boolean;
  tier_order: number;
}

export interface Integration {
  id: string;
  product_id: string;
  name: string;
  category: string | null;
  url: string | null;
}

export interface ProductWithRelations extends Product {
  features: Feature[];
  pricing_tiers: PricingTier[];
  integrations: Integration[];
}

export interface CategoryInfo {
  category: string;
  slug: string;
  count: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Display name overrides for categories where deslugification fails
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'crm': 'CRM',
  'seo': 'SEO',
  'e-commerce': 'E-commerce',
  'hr-and-payroll': 'HR & Payroll',
  'it-service-management': 'IT Service Management',
  'applicant-tracking-system-ats': 'Applicant Tracking System (ATS)',
  'ai-and-machine-learning': 'AI & Machine Learning',
  'no-code-low-code': 'No-Code/Low-Code',
  'devops': 'DevOps',
  'wordpress-themes-and-plugins': 'WordPress Themes & Plugins',
  'healthcare-it': 'Healthcare IT',
  'point-of-sale': 'Point of Sale',
};

export function deslugifyCategory(slug: string): string {
  if (CATEGORY_DISPLAY_NAMES[slug]) return CATEGORY_DISPLAY_NAMES[slug];
  return slug
    .replace(/-/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Build Score ────────────────────────────────────────────────────────────

export interface BuildScoreResult {
  score: number;
  label: string;
  color: string;
  description: string;
}

export function calculateBuildScore(product: {
  features?: any[];
  pricing_tiers?: any[];
  integrations?: any[];
  normalized_category?: string | null;
}): BuildScoreResult {
  const featureCount = product.features?.length || 0;
  const integrationCount = product.integrations?.length || 0;

  let score = 5; // Start at easiest

  // Feature complexity
  if (featureCount > 100) score -= 2;
  else if (featureCount > 60) score -= 1;

  // Integration complexity
  if (integrationCount > 50) score -= 1;
  else if (integrationCount > 25) score -= 0.5;

  // Category complexity
  const hardCategories = ['financial management', 'accounting software', 'cybersecurity', 'cloud infrastructure', 'database'];
  const mediumCategories = ['crm', 'hr & payroll', 'marketing automation', 'e-commerce'];
  const cat = product.normalized_category?.toLowerCase() || '';
  if (hardCategories.some(c => cat.includes(c))) score -= 1;
  else if (mediumCategories.some(c => cat.includes(c))) score -= 0.5;

  // Clamp to 1-5
  score = Math.max(1, Math.min(5, Math.round(score)));

  const labels: Record<number, { label: string; color: string; description: string }> = {
    5: { label: 'Weekend Project', color: 'emerald', description: 'Build a working replacement in a weekend with AI tools' },
    4: { label: 'Few Days', color: 'teal', description: 'A few focused days to build a solid replacement' },
    3: { label: '1-2 Weeks', color: 'amber', description: 'Plan for 1-2 weeks of building with AI assistance' },
    2: { label: 'Multi-Week', color: 'orange', description: 'A multi-week project requiring careful planning' },
    1: { label: 'Major Project', color: 'red', description: 'A significant undertaking — consider phased approach' },
  };

  return { score, ...labels[score] };
}

// ─── Product Queries ────────────────────────────────────────────────────────

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const { data: product, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) return null;

  const [featuresRes, pricingRes, integrationsRes] = await Promise.all([
    supabase
      .from('reaper_features')
      .select('*')
      .eq('product_id', product.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('reaper_pricing_tiers')
      .select('*')
      .eq('product_id', product.id)
      .order('tier_order', { ascending: true }),
    supabase
      .from('reaper_integrations')
      .select('*')
      .eq('product_id', product.id)
      .order('name', { ascending: true }),
  ]);

  return {
    ...product,
    features: featuresRes.data ?? [],
    pricing_tiers: pricingRes.data ?? [],
    integrations: integrationsRes.data ?? [],
  } as ProductWithRelations;
}

export async function listProducts(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{ products: Product[]; total: number }> {
  const { page = 1, limit = 24, category, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('reaper_products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('quality_score', { ascending: false });

  if (category) {
    query = query.eq('normalized_category', category);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,tagline.ilike.%${search}%,category.ilike.%${search}%,normalized_category.ilike.%${search}%`
    );
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('listProducts error:', error);
    return { products: [], total: 0 };
  }

  return { products: (data ?? []) as Product[], total: count ?? 0 };
}

// ─── Category Queries ───────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryInfo[]> {
  // Fetch ALL products (paginated — Supabase default limit is 1000)
  let allRows: { normalized_category: string }[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('normalized_category')
      .eq('is_active', true)
      .not('normalized_category', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allRows.push(...(data as { normalized_category: string }[]));
    if (data.length < pageSize) break;
    page++;
  }

  const counts: Record<string, number> = {};
  for (const row of allRows) {
    const cat = row.normalized_category;
    counts[cat] = (counts[cat] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      slug: slugifyCategory(category),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getCategoryProducts(
  categoryName: string
): Promise<Product[]> {
  // Fetch ALL products in this category (paginated)
  let allProducts: Product[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('*')
      .eq('is_active', true)
      .eq('normalized_category', categoryName)
      .order('quality_score', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allProducts.push(...(data as Product[]));
    if (data.length < pageSize) break;
    page++;
  }
  return allProducts;
}

// ─── Related Products ───────────────────────────────────────────────────────

export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit: number = 6
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .eq('normalized_category', category)
    .neq('slug', excludeSlug)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

export async function getProductsWithFeatureCategory(
  featureCategory: string,
  excludeProductId: string,
  limit: number = 5
): Promise<Product[]> {
  // Get product IDs that have features in this category
  const { data: featureRows, error: fErr } = await supabase
    .from('reaper_features')
    .select('product_id')
    .eq('category', featureCategory)
    .neq('product_id', excludeProductId)
    .limit(50);

  if (fErr || !featureRows || featureRows.length === 0) return [];

  const productIds = Array.from(
    new Set(featureRows.map((r) => r.product_id))
  ).slice(0, limit);

  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .in('id', productIds)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Search ─────────────────────────────────────────────────────────────────

export async function searchProducts(
  query: string,
  limit: number = 20
): Promise<Product[]> {
  // Try full-text search first
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .map((w) => w + ':*')
    .join(' & ');

  const { data: ftsData, error: ftsError } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .textSearch('search_vector', tsQuery)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (!ftsError && ftsData && ftsData.length > 0) {
    return ftsData as Product[];
  }

  // Fallback to ilike
  const sanitized = query.replace(/[%_\\]/g, '\\$&');
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .or(
      `name.ilike.%${sanitized}%,tagline.ilike.%${sanitized}%,category.ilike.%${sanitized}%,normalized_category.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
    )
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Featured / Recent / Stats ──────────────────────────────────────────────

export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

export async function getRecentProducts(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .not('last_scraped_at', 'is', null)
    .order('last_scraped_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

export async function getTotalProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reaper_products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) return 0;
  return count ?? 0;
}

export async function getTotalFeatureCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reaper_features')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}

export async function getTotalCategoryCount(): Promise<number> {
  const categories = await getCategories();
  return categories.length;
}

// ─── Alternatives ────────────────────────────────────────────────────────────

export async function getAlternatives(
  productId: string,
  category: string,
  limit: number = 15
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .eq('normalized_category', category)
    .neq('id', productId)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Reverse Integration Lookup ──────────────────────────────────────────────

export async function getProductsIntegratingWith(
  productName: string,
  excludeProductId: string,
  limit: number = 50
): Promise<Product[]> {
  // Find integration rows where the integration name matches this product
  const { data: integrationRows, error: iErr } = await supabase
    .from('reaper_integrations')
    .select('product_id')
    .ilike('name', productName)
    .neq('product_id', excludeProductId)
    .limit(limit);

  if (iErr || !integrationRows || integrationRows.length === 0) return [];

  const productIds = Array.from(
    new Set(integrationRows.map((r) => r.product_id))
  );

  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .in('id', productIds)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Product Lite (for pages that only need basic product info) ──────────────

export async function getProductLiteBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Product;
}

export async function getProductIntegrations(
  productId: string
): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('reaper_integrations')
    .select('*')
    .eq('product_id', productId)
    .order('name', { ascending: true });

  if (error) return [];
  return (data ?? []) as Integration[];
}

export async function getProductPricingTiers(
  productId: string
): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from('reaper_pricing_tiers')
    .select('*')
    .eq('product_id', productId)
    .order('tier_order', { ascending: true });

  if (error) return [];
  return (data ?? []) as PricingTier[];
}

// ─── All Product Slugs (for sitemap / static params) ─────────────────────────

export async function getAllProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('slug')
    .eq('is_active', true)
    .not('slug', 'is', null);

  if (error || !data) return [];
  return data.map((r) => r.slug).filter(Boolean);
}

// ─── Feature Taxonomy ───────────────────────────────────────────────────────

export interface FeatureCategoryInfo {
  category: string;
  slug: string;
  featureCount: number;
  productCount: number;
}

export async function getFeatureTaxonomy(): Promise<FeatureCategoryInfo[]> {
  const { data, error } = await supabase
    .from('reaper_features')
    .select('category, product_id')
    .not('category', 'is', null);

  if (error || !data) return [];

  const categories: Record<string, { featureCount: number; productIds: Record<string, boolean> }> = {};
  for (const row of data) {
    const cat = row.category as string;
    if (!categories[cat]) categories[cat] = { featureCount: 0, productIds: {} };
    categories[cat].featureCount++;
    categories[cat].productIds[row.product_id] = true;
  }

  return Object.entries(categories)
    .map(([category, info]) => ({
      category,
      slug: slugifyCategory(category),
      featureCount: info.featureCount,
      productCount: Object.keys(info.productIds).length,
    }))
    .sort((a, b) => b.productCount - a.productCount);
}

export async function getProductsByFeatureTaxonomy(
  featureCategory: string,
  limit: number = 50
): Promise<Product[]> {
  const { data: featureRows, error: fErr } = await supabase
    .from('reaper_features')
    .select('product_id')
    .eq('category', featureCategory)
    .limit(200);

  if (fErr || !featureRows || featureRows.length === 0) return [];

  const productIds = Array.from(
    new Set(featureRows.map((r) => r.product_id))
  ).slice(0, limit);

  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .in('id', productIds)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Pricing Overview ───────────────────────────────────────────────────────

export interface PricingOverview {
  product: Product;
  minPrice: number | null;
  hasFreeTier: boolean;
}

export async function getProductsWithPricing(): Promise<PricingOverview[]> {
  const { data: products, error: pErr } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .order('quality_score', { ascending: false });

  if (pErr || !products) return [];

  const { data: tiers, error: tErr } = await supabase
    .from('reaper_pricing_tiers')
    .select('product_id, price_monthly, price_label');

  if (tErr || !tiers) return [];

  const pricingMap: Record<string, { minPrice: number | null; hasFreeTier: boolean }> = {};
  for (const tier of tiers) {
    if (!pricingMap[tier.product_id]) {
      pricingMap[tier.product_id] = { minPrice: null, hasFreeTier: false };
    }
    const entry = pricingMap[tier.product_id];

    if (tier.price_monthly === 0 || tier.price_label?.toLowerCase().includes('free')) {
      entry.hasFreeTier = true;
    }

    if (tier.price_monthly != null && tier.price_monthly > 0) {
      if (entry.minPrice === null || tier.price_monthly < entry.minPrice) {
        entry.minPrice = tier.price_monthly;
      }
    }
  }

  return products.map((p) => ({
    product: p as Product,
    minPrice: pricingMap[p.id]?.minPrice ?? null,
    hasFreeTier: pricingMap[p.id]?.hasFreeTier ?? false,
  }));
}

// ─── Top Product Slugs (for generateStaticParams) ───────────────────────────

export async function getTopProductSlugs(limit: number = 100): Promise<string[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('slug')
    .eq('is_active', true)
    .not('slug', 'is', null)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((r) => r.slug).filter(Boolean);
}

// ─── Best-of Category Queries ───────────────────────────────────────────────

export async function getTopProductsByCategory(
  categoryName: string,
  limit: number = 15
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .eq('normalized_category', categoryName)
    .gte('quality_score', 0.3)
    .order('quality_score', { ascending: false })
    .order('feature_count', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// ─── Integration cross-linking ──────────────────────────────────────────────

export async function getProductSlugMap(
  names: string[]
): Promise<Record<string, string>> {
  if (names.length === 0) return {};

  // Batch lookup: find products whose name matches integration names
  const { data, error } = await supabase
    .from('reaper_products')
    .select('name, slug')
    .eq('is_active', true)
    .in('name', names);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.slug) {
      map[row.name] = row.slug;
    }
  }

  // For unmatched names, try case-insensitive lookup
  const unmatched = names.filter((n) => !map[n]);
  if (unmatched.length > 0) {
    const lowerNames = unmatched.map((n) => n.toLowerCase());
    const { data: fuzzyData } = await supabase
      .from('reaper_products')
      .select('name, slug')
      .eq('is_active', true)
      .not('slug', 'is', null);

    if (fuzzyData) {
      const lowerMap: Record<string, { name: string; slug: string }> = {};
      for (const row of fuzzyData) {
        if (row.slug) {
          lowerMap[row.name.toLowerCase()] = row;
        }
      }
      for (const name of unmatched) {
        const match = lowerMap[name.toLowerCase()];
        if (match) {
          map[name] = match.slug;
        }
      }
    }
  }

  return map;
}

// ─── Products by Multiple Categories (for industry pages) ────────────────────

export async function getProductsByCategories(
  categoryNames: string[],
  limitPerCategory: number = 3
): Promise<Record<string, Product[]>> {
  if (categoryNames.length === 0) return {};

  // Fetch ALL matching products (paginated)
  let allData: Product[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('*')
      .eq('is_active', true)
      .in('normalized_category', categoryNames)
      .order('quality_score', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allData.push(...(data as Product[]));
    if (data.length < pageSize) break;
    page++;
  }

  const result: Record<string, Product[]> = {};
  for (const product of allData) {
    const cat = product.normalized_category;
    if (!cat) continue;
    if (!result[cat]) result[cat] = [];
    if (result[cat].length < limitPerCategory) {
      result[cat].push(product);
    }
  }

  return result;
}
