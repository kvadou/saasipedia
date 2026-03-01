import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://saasipedia.com';

  // Fetch all active product slugs with last_scraped_at
  const { data: products } = await supabase
    .from('reaper_products')
    .select('slug, last_scraped_at, updated_at')
    .eq('is_active', true)
    .not('slug', 'is', null);

  // Fetch all distinct categories
  const { data: categoryRows } = await supabase
    .from('reaper_products')
    .select('category')
    .eq('is_active', true)
    .not('category', 'is', null);

  const uniqueCategories = Array.from(
    new Set((categoryRows ?? []).map((r) => r.category as string))
  );

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/wiki/${p.slug}`,
    lastModified: p.last_scraped_at
      ? new Date(p.last_scraped_at)
      : p.updated_at
      ? new Date(p.updated_at)
      : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Category pages
  const slugify = (cat: string) =>
    cat
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const categoryPages: MetadataRoute.Sitemap = uniqueCategories.map((cat) => ({
    url: `${baseUrl}/category/${slugify(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
