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

// ─── Homepage: Top ranked products per category ─────────────────────────────

export async function getTopRankedByCategories(
  categoryNames: string[],
  limit: number = 3
): Promise<Record<string, { name: string; slug: string }[]>> {
  if (categoryNames.length === 0) return {};

  // Fetch general rankings for these categories
  const { data: relevanceRows, error: rErr } = await supabase
    .from('industry_product_relevance')
    .select('product_id, relevance_rank')
    .eq('industry_slug', 'general')
    .lte('relevance_rank', limit);

  if (rErr || !relevanceRows || relevanceRows.length === 0) return {};

  const productIds = relevanceRows.map((r) => r.product_id);

  // Fetch product details
  const { data: products, error: pErr } = await supabase
    .from('reaper_products')
    .select('id, name, slug, normalized_category')
    .eq('is_active', true)
    .in('normalized_category', categoryNames)
    .in('id', productIds);

  if (pErr || !products) return {};

  // Build rank lookup
  const rankMap = new Map<string, number>();
  for (const r of relevanceRows) {
    rankMap.set(r.product_id, r.relevance_rank);
  }

  // Group by category, sorted by rank, deduplicated by name
  const result: Record<string, { name: string; slug: string }[]> = {};
  for (const p of products) {
    const cat = p.normalized_category;
    if (!result[cat]) result[cat] = [];
    // Skip if we already have a product with this name (handles duplicate DB entries)
    if (!result[cat].some((existing) => existing.name === p.name)) {
      result[cat].push({ name: p.name, slug: p.slug });
    }
  }

  // Sort each category by rank
  for (const cat of Object.keys(result)) {
    result[cat].sort((a, b) => {
      const aProduct = products.find((p) => p.slug === a.slug);
      const bProduct = products.find((p) => p.slug === b.slug);
      return (rankMap.get(aProduct?.id ?? '') ?? 999) - (rankMap.get(bProduct?.id ?? '') ?? 999);
    });
    result[cat] = result[cat].slice(0, limit);
  }

  return result;
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

// ─── Industry Relevance Queries ──────────────────────────────────────────────

export interface RelevanceData {
  relevance_rank: number;
  market_position: string;
  industry_specific: boolean;
}

export type RankedProduct = Product & { relevance?: RelevanceData };

export async function getCategoryProductsRanked(
  categoryName: string,
  industrySlug?: string
): Promise<RankedProduct[]> {
  // Fetch all products in this category
  const products = await getCategoryProducts(categoryName);
  if (products.length === 0) return products;

  // Use 'general' rankings when no industry specified, otherwise industry-specific
  const rankingSlug = industrySlug || 'general';

  // Fetch relevance data for these products + industry
  const productIds = products.map((p) => p.id);
  const { data: relevanceRows, error } = await supabase
    .from('industry_product_relevance')
    .select('product_id, relevance_rank, market_position, industry_specific')
    .eq('industry_slug', rankingSlug)
    .in('product_id', productIds);

  if (error || !relevanceRows || relevanceRows.length === 0) return products;

  // Build lookup map
  const relevanceMap = new Map<string, RelevanceData>();
  for (const row of relevanceRows) {
    relevanceMap.set(row.product_id, {
      relevance_rank: row.relevance_rank,
      market_position: row.market_position,
      industry_specific: row.industry_specific,
    });
  }

  // Merge: ranked products first (sorted by rank), then unranked (sorted by quality_score)
  const ranked: RankedProduct[] = [];
  const unranked: RankedProduct[] = [];

  for (const product of products) {
    const rel = relevanceMap.get(product.id);
    if (rel) {
      ranked.push({ ...product, relevance: rel });
    } else {
      unranked.push(product);
    }
  }

  ranked.sort((a, b) => (a.relevance!.relevance_rank - b.relevance!.relevance_rank));

  // Deduplicate by product name (handles duplicate DB entries)
  const seen = new Set<string>();
  const deduped: RankedProduct[] = [];
  for (const product of [...ranked, ...unranked]) {
    const nameLower = product.name.toLowerCase();
    if (!seen.has(nameLower)) {
      seen.add(nameLower);
      deduped.push(product);
    }
  }
  return deduped;
}

export async function getIndustryProductCounts(
  industrySlug: string,
  categoryNames: string[]
): Promise<Record<string, { total: number; ranked: number }>> {
  if (categoryNames.length === 0) return {};

  // Get total product counts per category
  let allProducts: { normalized_category: string }[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('normalized_category')
      .eq('is_active', true)
      .in('normalized_category', categoryNames)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allProducts.push(...(data as { normalized_category: string }[]));
    if (data.length < pageSize) break;
    page++;
  }

  const totals: Record<string, number> = {};
  for (const row of allProducts) {
    totals[row.normalized_category] = (totals[row.normalized_category] || 0) + 1;
  }

  // Get ranked counts from relevance table
  const { data: rankedRows, error: rErr } = await supabase
    .from('industry_product_relevance')
    .select('product_id, industry_slug')
    .eq('industry_slug', industrySlug);

  // Count ranked products that are in our categories
  const rankedProductIds = new Set((rankedRows || []).map(r => r.product_id));

  // We need to check which of these products are in our target categories
  // Fetch product categories for ranked products
  const rankedByCategory: Record<string, number> = {};
  if (rankedProductIds.size > 0) {
    const rankedIds = Array.from(rankedProductIds);
    let rankedProducts: { id: string; normalized_category: string }[] = [];
    for (let i = 0; i < rankedIds.length; i += 1000) {
      const batch = rankedIds.slice(i, i + 1000);
      const { data } = await supabase
        .from('reaper_products')
        .select('id, normalized_category')
        .eq('is_active', true)
        .in('id', batch)
        .in('normalized_category', categoryNames);
      if (data) rankedProducts.push(...(data as { id: string; normalized_category: string }[]));
    }
    for (const p of rankedProducts) {
      rankedByCategory[p.normalized_category] = (rankedByCategory[p.normalized_category] || 0) + 1;
    }
  }

  const result: Record<string, { total: number; ranked: number }> = {};
  for (const cat of categoryNames) {
    result[cat] = {
      total: totals[cat] || 0,
      ranked: rankedByCategory[cat] || 0,
    };
  }
  return result;
}

// ─── Industry Compliance Mapping ──────────────────────────────────────────

const INDUSTRY_COMPLIANCE: Record<string, { name: string; description: string }> = {
  healthcare: { name: 'HIPAA', description: 'HIPAA compliance for protecting patient health information' },
  'financial-services': { name: 'SOC 2', description: 'SOC 2 compliance for financial data security and reporting' },
  'legal-services': { name: 'ABA', description: 'ABA ethics rules for client data confidentiality' },
  education: { name: 'FERPA', description: 'FERPA compliance for student data privacy' },
  'real-estate': { name: 'RESPA', description: 'RESPA compliance for real estate settlement procedures' },
};

// ─── FAQ Generation ──────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateCategoryFAQs(
  categoryName: string,
  industryName: string,
  industrySlug: string,
  products: RankedProduct[],
): FAQItem[] {
  const faqs: FAQItem[] = [];
  const year = new Date().getFullYear();
  const top3 = products.slice(0, 3);

  if (top3.length >= 3) {
    faqs.push({
      question: `What is the best ${categoryName.toLowerCase()} software for ${industryName.toLowerCase()} in ${year}?`,
      answer: `Based on our analysis, the top ${categoryName.toLowerCase()} tools for ${industryName.toLowerCase()} are ${top3[0].name} (#1), ${top3[1].name} (#2), and ${top3[2].name} (#3). Rankings are based on industry relevance, feature depth, and data quality.`,
    });
  }

  const industrySpecificProducts = products.filter((p) => p.relevance?.industry_specific);
  if (industrySpecificProducts.length > 0) {
    const names = industrySpecificProducts.slice(0, 5).map((p) => p.name).join(', ');
    faqs.push({
      question: `How many ${categoryName.toLowerCase()} tools are designed specifically for ${industryName.toLowerCase()}?`,
      answer: `${industrySpecificProducts.length} ${categoryName.toLowerCase()} ${industrySpecificProducts.length === 1 ? 'product is' : 'products are'} built specifically for ${industryName.toLowerCase()} businesses, including ${names}.`,
    });
  }

  if (top3.length >= 2) {
    const p1 = top3[0];
    const p2 = top3[1];
    const p1Pos = p1.relevance?.market_position || 'top-ranked';
    const p2Pos = p2.relevance?.market_position || 'runner-up';
    const p1Specific = p1.relevance?.industry_specific ? `industry-specific ${industryName.toLowerCase()} solution` : 'general-purpose solution';
    const p2Specific = p2.relevance?.industry_specific ? `industry-specific ${industryName.toLowerCase()} solution` : 'general-purpose solution';
    faqs.push({
      question: `What's the difference between ${p1.name} and ${p2.name} for ${industryName.toLowerCase()}?`,
      answer: `${p1.name} is a ${p1Pos} ${p1Specific}, while ${p2.name} is a ${p2Pos} ${p2Specific}. Both rank in the top 3 for ${industryName.toLowerCase()} ${categoryName.toLowerCase()}.`,
    });
  }

  const compliance = INDUSTRY_COMPLIANCE[industrySlug];
  if (compliance) {
    faqs.push({
      question: `Do ${categoryName.toLowerCase()} tools for ${industryName.toLowerCase()} need to be ${compliance.name}-compliant?`,
      answer: `Yes, ${industryName.toLowerCase()} businesses typically need ${compliance.description}. When choosing ${categoryName.toLowerCase()} software, verify that the vendor meets ${compliance.name} requirements for your use case.`,
    });
  }

  return faqs;
}

// ─── Category Knowledge Panel ────────────────────────────────────────────

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'CRM Software':
    'Customer relationship management (CRM) software centralizes every interaction a business has with prospects and customers — from first contact through post-sale support — into a single system of record. Sales teams, account managers, and support staff use CRMs to track deals, automate follow-ups, and forecast revenue. Modern CRMs have expanded beyond contact databases to include pipeline analytics, marketing attribution, and AI-driven lead scoring.',
  'Project Management':
    'Project management software provides structured workflows for planning, executing, and tracking work across teams and departments. Product managers, engineering leads, and operations teams rely on these tools to break initiatives into tasks, assign ownership, set deadlines, and visualize progress through boards, timelines, and Gantt charts. As remote and hybrid work has become standard, project management platforms have become the operational backbone of most knowledge-work organizations.',
  'Accounting Software':
    'Accounting software automates the core financial recordkeeping that every business requires — general ledger management, accounts payable and receivable, invoicing, bank reconciliation, and tax preparation. Finance teams and small business owners use these tools to maintain accurate books, generate financial statements, and stay compliant with tax regulations. Cloud-based accounting platforms have largely replaced desktop software, enabling real-time financial visibility and integration with banking and payroll systems.',
  'Email Marketing':
    'Email marketing software enables businesses to design, send, and analyze targeted email campaigns to subscriber lists. Marketing teams use these platforms to nurture leads, announce products, deliver newsletters, and drive conversions through segmented audiences and automated drip sequences. Advanced platforms include A/B testing, deliverability optimization, and behavioral triggers that send messages based on subscriber actions.',
  'Help Desk Software':
    'Help desk software organizes customer support requests into a ticketing system that tracks issues from submission to resolution. Support teams use these tools to manage multi-channel inquiries (email, chat, phone, social), enforce SLAs, and build self-service knowledge bases that deflect common questions. Modern help desks incorporate AI-assisted routing, canned responses, and customer satisfaction scoring to improve response quality at scale.',
  'HR Software':
    'Human resources (HR) software manages the full employee lifecycle — recruiting, onboarding, payroll, benefits administration, performance reviews, and offboarding. HR departments and people operations teams use these platforms to centralize employee records, ensure labor law compliance, and automate time-consuming administrative processes. The category spans point solutions for specific HR functions and comprehensive HRIS/HCM suites that unify all people management in one system.',
  'Marketing Automation':
    'Marketing automation software orchestrates multi-channel campaigns that respond dynamically to prospect and customer behavior across email, web, social, and advertising channels. Marketing teams use these platforms to score leads, trigger personalized content sequences, and hand off sales-ready prospects to CRM systems. By replacing manual campaign execution with rule-based and AI-driven workflows, marketing automation enables small teams to run sophisticated demand-generation programs at enterprise scale.',
  'Video Conferencing':
    'Video conferencing software enables real-time audio and video communication between individuals and groups over the internet, replacing in-person meetings for distributed teams. Businesses of all sizes use these tools for team standups, client calls, webinars, and all-hands meetings, typically with screen sharing, recording, and chat features. The category experienced explosive growth during the shift to remote work and now serves as foundational infrastructure for modern workplace communication.',
  'Cloud Storage':
    'Cloud storage services provide on-demand file storage and synchronization across devices, eliminating reliance on local hard drives and on-premises servers. Teams use cloud storage to share documents, collaborate on files in real time, and maintain version history with automatic backups. Enterprise-grade platforms add granular access controls, audit logging, and compliance certifications required by regulated industries.',
  'E-Commerce Platforms':
    'E-commerce platforms provide the infrastructure for businesses to sell products and services online, including storefront design, product catalog management, shopping cart functionality, and payment processing. Retailers, D2C brands, and B2B sellers use these platforms to launch and operate online stores without building custom software. Modern platforms extend into inventory management, multi-channel selling (marketplaces, social commerce), and built-in marketing tools.',
  'Business Intelligence':
    'Business intelligence (BI) software transforms raw data from databases, spreadsheets, and SaaS applications into interactive dashboards, reports, and visualizations that inform strategic decisions. Analysts, executives, and operations teams use BI tools to identify trends, monitor KPIs, and answer ad-hoc business questions without writing SQL. The category ranges from self-service analytics platforms designed for business users to enterprise tools with advanced data modeling and governed semantic layers.',
  'Cybersecurity Software':
    'Cybersecurity software protects organizations from digital threats including malware, ransomware, phishing, data breaches, and unauthorized access to systems and data. IT and security teams deploy these tools across endpoints, networks, cloud infrastructure, and email systems to detect, prevent, and respond to attacks. The category encompasses a wide range of specialized solutions — from antivirus and firewalls to SIEM platforms, identity management, and zero-trust network access.',
  'ERP Software':
    'Enterprise resource planning (ERP) software integrates core business processes — finance, supply chain, manufacturing, procurement, and human resources — into a unified system with a shared database. Operations leaders and finance teams use ERPs to eliminate data silos, standardize workflows, and gain a single source of truth across the organization. ERP implementations are among the most consequential software decisions a company makes, often reshaping how entire organizations operate.',
  'Learning Management Systems':
    'Learning management systems (LMS) deliver, track, and manage training and educational content for employees, students, or customers. HR departments use them for onboarding and compliance training, educational institutions for course delivery, and SaaS companies for customer education programs. Modern LMS platforms support video-based learning, assessments, certifications, and learning path customization with analytics on completion rates and knowledge retention.',
  'Inventory Management':
    'Inventory management software tracks stock levels, orders, and fulfillment across warehouses, retail locations, and sales channels in real time. Operations teams and supply chain managers use these tools to prevent stockouts, reduce carrying costs, and automate reorder points based on demand forecasting. For businesses selling physical products, accurate inventory management directly impacts cash flow, customer satisfaction, and operational efficiency.',
  'Social Media Management':
    'Social media management software centralizes the creation, scheduling, publishing, and analysis of content across multiple social networks from a single interface. Marketing teams and social media managers use these platforms to maintain consistent posting schedules, respond to audience engagement, and measure the performance of organic and paid social campaigns. Advanced tools include social listening, competitor benchmarking, and AI-assisted content generation.',
  'Customer Success Software':
    'Customer success software helps subscription businesses proactively manage customer health, reduce churn, and identify expansion opportunities across their account base. Customer success managers use these platforms to monitor product usage data, track health scores, automate outreach based on risk signals, and manage renewal workflows. The category emerged alongside the SaaS business model, where recurring revenue makes customer retention as important as acquisition.',
  'Recruitment Software':
    'Recruitment software (also called applicant tracking systems or ATS) manages the end-to-end hiring process from job posting and candidate sourcing through interviews, evaluations, and offer management. Talent acquisition teams and hiring managers use these tools to organize applicant pipelines, collaborate on evaluations, and ensure consistent hiring practices across the organization. Modern recruitment platforms incorporate AI-powered resume screening, interview scheduling automation, and integrations with job boards and LinkedIn.',
  'Content Management Systems':
    'Content management systems (CMS) enable teams to create, organize, publish, and update digital content — primarily websites and web applications — without requiring deep technical expertise. Marketing teams, editors, and developers use CMS platforms to manage everything from corporate websites and blogs to complex multi-site digital experiences. The category spans traditional monolithic CMS platforms with built-in frontends and headless CMS solutions that deliver content via API to any channel.',
  'Payment Processing':
    'Payment processing software enables businesses to accept and manage financial transactions from customers via credit cards, debit cards, digital wallets, bank transfers, and other payment methods. E-commerce businesses, SaaS companies, and brick-and-mortar retailers depend on payment processors to handle transaction authorization, fraud detection, settlement, and regulatory compliance (PCI DSS). Modern platforms have evolved beyond simple payment acceptance to include subscription billing, multi-currency support, and embedded finance features.',
};

export function generateCategoryKnowledgePanel(
  categoryName: string,
  productCount: number,
  topProducts: { name: string }[],
): { title: string; description: string } {
  const name = categoryName.toLowerCase();
  const nameSuffix = name.endsWith('software') ? '' : ' software';
  const top3Names = topProducts.slice(0, 3).map((p) => p.name);
  const year = new Date().getFullYear();

  // Use hardcoded description if available, otherwise generate a smarter fallback
  let categoryDesc = CATEGORY_DESCRIPTIONS[categoryName];

  if (!categoryDesc) {
    const isPlural = name.endsWith('s') || name.endsWith('platforms') || name.endsWith('systems');
    const verb = isPlural ? 'are tools that help' : 'is a category of tools that helps';
    categoryDesc = `${categoryName}${nameSuffix} ${verb} businesses streamline operations, improve efficiency, and reduce manual work in the ${name.replace(/ software$/i, '')} domain. Organizations across industries — from startups to enterprises — adopt ${name} to automate repetitive tasks, centralize data, and gain actionable insights that drive better decision-making.`;
  }

  const dynamicParts = [
    ` SaaSipedia tracks ${productCount} ${name}${nameSuffix} products as of ${year}.`,
    top3Names.length >= 3
      ? ` The most widely adopted products include ${top3Names[0]}, ${top3Names[1]}, and ${top3Names[2]}.`
      : top3Names.length > 0
        ? ` Notable products include ${top3Names.join(' and ')}.`
        : '',
    ` Each product profile includes a complete feature breakdown, pricing tiers, integration list, and comparison tools.`,
  ].join('');

  return {
    title: `What is ${categoryName}${nameSuffix}?`,
    description: categoryDesc + dynamicParts,
  };
}

// ─── Glossary ──────────────────────────────────────────────────────────────

export interface GlossaryTerm {
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  isAiPowered: boolean;
}

export async function getFeatureGlossaryTerms(limit = 200): Promise<GlossaryTerm[]> {
  // Get distinct feature names with counts
  let rpcData: any[] | null = null;
  try {
    const res = await supabase
      .rpc('get_feature_glossary', { result_limit: limit });
    if (!res.error && res.data) rpcData = res.data;
  } catch {
    // RPC doesn't exist — fall through to fallback
  }
  const data = rpcData;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    // Fallback: query features table directly
    let allFeatures: { name: string; description: string | null; is_ai_powered: boolean }[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data: features, error: fErr } = await supabase
        .from('reaper_features')
        .select('name, description, is_ai_powered')
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (fErr || !features || features.length === 0) break;
      allFeatures.push(...features);
      if (features.length < pageSize) break;
      page++;
    }

    if (allFeatures.length === 0) return [];

    // Aggregate by name
    const termMap = new Map<string, { name: string; description: string | null; count: number; isAi: boolean }>();
    for (const f of allFeatures) {
      const key = f.name.toLowerCase();
      const existing = termMap.get(key);
      if (existing) {
        existing.count++;
        if (f.is_ai_powered) existing.isAi = true;
        if (!existing.description && f.description) existing.description = f.description;
      } else {
        termMap.set(key, {
          name: f.name,
          description: f.description,
          count: 1,
          isAi: f.is_ai_powered,
        });
      }
    }

    return Array.from(termMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((t) => ({
        name: t.name,
        slug: slugifyCategory(t.name),
        description: t.description,
        productCount: t.count,
        isAiPowered: t.isAi,
      }));
  }

  return (data as any[]).map((d: any) => ({
    name: d.name,
    slug: slugifyCategory(d.name),
    description: d.description,
    productCount: d.product_count,
    isAiPowered: d.is_ai_powered,
  }));
}

export async function getFeatureGlossaryTerm(featureName: string): Promise<{
  name: string;
  description: string | null;
  products: { name: string; slug: string; category: string | null }[];
  isAiPowered: boolean;
} | null> {
  const { data: features } = await supabase
    .from('reaper_features')
    .select('name, description, is_ai_powered, product_id')
    .ilike('name', featureName.replace(/-/g, ' ').replace(/%/g, ''))
    .limit(100);

  if (!features || features.length === 0) return null;

  const productIds = Array.from(new Set(features.map((f) => f.product_id)));
  const { data: products } = await supabase
    .from('reaper_products')
    .select('name, slug, normalized_category')
    .in('id', productIds.slice(0, 50))
    .eq('is_active', true)
    .order('quality_score', { ascending: false });

  const firstWithDesc = features.find((f) => f.description);

  return {
    name: features[0].name,
    description: firstWithDesc?.description || null,
    products: (products || []).map((p) => ({
      name: p.name,
      slug: p.slug,
      category: p.normalized_category,
    })),
    isAiPowered: features.some((f) => f.is_ai_powered),
  };
}
