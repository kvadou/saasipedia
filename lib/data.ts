import { supabase } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  url: string | null;
  category: string | null;
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

export function deslugifyCategory(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,tagline.ilike.%${search}%,category.ilike.%${search}%`
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
  const { data, error } = await supabase
    .from('reaper_products')
    .select('category')
    .eq('is_active', true)
    .not('category', 'is', null);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const cat = row.category as string;
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
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .eq('category', categoryName)
    .order('quality_score', { ascending: false });

  if (error) return [];
  return (data ?? []) as Product[];
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
    .eq('category', category)
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
  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .or(
      `name.ilike.%${query}%,tagline.ilike.%${query}%,category.ilike.%${query}%`
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
