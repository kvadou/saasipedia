import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { slugifyCategory } from '@/lib/data';

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

  // Fetch distinct feature categories
  const { data: featureCatRows } = await supabase
    .from('reaper_features')
    .select('category')
    .not('category', 'is', null);

  const uniqueFeatureCategories = Array.from(
    new Set((featureCatRows ?? []).map((r) => r.category as string))
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
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
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
  const categoryPages: MetadataRoute.Sitemap = uniqueCategories.map((cat) => ({
    url: `${baseUrl}/category/${slugifyCategory(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Feature taxonomy pages
  const featurePages: MetadataRoute.Sitemap = uniqueFeatureCategories.map((cat) => ({
    url: `${baseUrl}/features/${slugifyCategory(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Alternatives pages (one per product)
  const alternativesPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/alternatives/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Integrations pages (one per product)
  const integrationsPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/integrations/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...featurePages,
    ...alternativesPages,
    ...integrationsPages,
  ];
}
