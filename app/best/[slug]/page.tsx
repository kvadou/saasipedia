import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Layers, ArrowRight, Star, Check } from 'lucide-react';
import {
  getCategories,
  getTopProductsByCategory,
  getProductPricingTiers,
  slugifyCategory,
  deslugifyCategory,
  type Product,
  type PricingTier,
  type CategoryInfo,
} from '@/lib/data';

export const revalidate = 3600;

// Audience segments that generate separate pages
const AUDIENCES = [
  { slug: 'small-business', label: 'Small Business', description: 'Tools designed for SMBs with limited budgets and lean teams.' },
  { slug: 'enterprise', label: 'Enterprise', description: 'Enterprise-grade solutions with advanced security, compliance, and scalability.' },
  { slug: 'startups', label: 'Startups', description: 'Affordable, fast-to-deploy tools perfect for growing startups.' },
  { slug: 'freelancers', label: 'Freelancers', description: 'Lightweight tools tailored for independent professionals and solo operators.' },
] as const;

interface BestOfEntry {
  categorySlug: string;
  categoryName: string;
  audienceSlug: string | null;
  audienceLabel: string | null;
}

function parseBestOfSlug(slug: string): BestOfEntry | null {
  // Try matching "{category}-for-{audience}" first
  for (const audience of AUDIENCES) {
    const suffix = `-for-${audience.slug}`;
    if (slug.endsWith(suffix)) {
      const catSlug = slug.slice(0, slug.length - suffix.length);
      return {
        categorySlug: catSlug,
        categoryName: deslugifyCategory(catSlug),
        audienceSlug: audience.slug,
        audienceLabel: audience.label,
      };
    }
  }

  // Just a category
  return {
    categorySlug: slug,
    categoryName: deslugifyCategory(slug),
    audienceSlug: null,
    audienceLabel: null,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  // Only generate pages for categories with enough products
  const viable = categories.filter((c) => c.count >= 3);

  const params: { slug: string }[] = [];

  for (const cat of viable) {
    // Base "best {category}" page
    params.push({ slug: cat.slug });

    // "best {category} for {audience}" pages — only for categories with 5+ products
    if (cat.count >= 5) {
      for (const audience of AUDIENCES) {
        params.push({ slug: `${cat.slug}-for-${audience.slug}` });
      }
    }
  }

  return params;
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = parseBestOfSlug(params.slug);
  if (!entry) return { title: 'Not Found' };

  const categories = await getCategories();
  const match = categories.find((c) => c.slug === entry.categorySlug);
  const categoryName = match?.category || entry.categoryName;

  const audience = entry.audienceLabel ? ` for ${entry.audienceLabel}` : '';
  const title = `Best ${categoryName} Software${audience} (${new Date().getFullYear()})`;
  const description = `Compare the top ${categoryName.toLowerCase()} tools${audience.toLowerCase()}. Features, pricing, and quality ratings for ${match?.count || 'the best'} products.`;

  return {
    title,
    description,
    alternates: { canonical: `/best/${params.slug}` },
    openGraph: {
      title: `${title} — SaaSipedia`,
      description,
    },
  };
}

function getStartingPrice(tiers: PricingTier[]): string {
  const prices = tiers
    .map((t) => t.price_monthly)
    .filter((p): p is number => p != null && p > 0)
    .sort((a, b) => a - b);
  if (prices.length === 0) {
    const hasFree = tiers.some(
      (t) => t.price_label?.toLowerCase().includes('free') || t.price_monthly === 0
    );
    return hasFree ? 'Free' : 'Contact';
  }
  return `$${prices[0]}/mo`;
}

function hasFreeTier(tiers: PricingTier[]): boolean {
  return tiers.some(
    (t) => t.price_label?.toLowerCase().includes('free') || t.price_monthly === 0
  );
}

export default async function BestOfPage({ params }: PageProps) {
  const entry = parseBestOfSlug(params.slug);
  if (!entry) notFound();

  const categories = await getCategories();
  const match = categories.find((c) => c.slug === entry.categorySlug);
  const categoryName = match?.category || entry.categoryName;

  const products = await getTopProductsByCategory(categoryName, 20);
  if (products.length === 0) notFound();

  // Fetch pricing for all products in parallel
  const pricingMap: Record<string, PricingTier[]> = {};
  const pricingResults = await Promise.all(
    products.map(async (p) => ({
      id: p.id,
      tiers: await getProductPricingTiers(p.id),
    }))
  );
  for (const r of pricingResults) {
    pricingMap[r.id] = r.tiers;
  }

  const audience = AUDIENCES.find((a) => a.slug === entry.audienceSlug);
  const year = new Date().getFullYear();
  const titleSuffix = audience ? ` for ${audience.label}` : '';

  // Related "best of" pages
  const relatedCategories = categories
    .filter((c) => c.slug !== entry.categorySlug && c.count >= 3)
    .slice(0, 8);

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: 'Best Software', item: 'https://saasipedia.com/best' },
      { '@type': 'ListItem', position: 3, name: `Best ${categoryName}${titleSuffix}`, item: `https://saasipedia.com/best/${params.slug}` },
    ],
  };

  const itemListData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} Software${titleSuffix}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://saasipedia.com/wiki/${p.slug}`,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6 flex-wrap">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-wiki-accent transition-colors">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Best {categoryName}{titleSuffix}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          Best {categoryName} Software{titleSuffix} ({year})
        </h1>
        <p className="text-wiki-text-muted max-w-3xl">
          {audience
            ? audience.description
            : `Top ${categoryName.toLowerCase()} tools ranked by data quality, features, and pricing. ${products.length} products compared.`}
        </p>
      </div>

      {/* Audience toggles */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/best/${entry.categorySlug}`}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            !entry.audienceSlug
              ? 'bg-wiki-accent text-white border-wiki-accent'
              : 'border-wiki-border text-wiki-text-muted hover:border-wiki-accent hover:text-wiki-accent'
          }`}
        >
          All
        </Link>
        {AUDIENCES.map((aud) => (
          <Link
            key={aud.slug}
            href={`/best/${entry.categorySlug}-for-${aud.slug}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              entry.audienceSlug === aud.slug
                ? 'bg-wiki-accent text-white border-wiki-accent'
                : 'border-wiki-border text-wiki-text-muted hover:border-wiki-accent hover:text-wiki-accent'
            }`}
          >
            {aud.label}
          </Link>
        ))}
      </div>

      {/* Product list */}
      <div className="space-y-4">
        {products.map((product, index) => {
          const tiers = pricingMap[product.id] || [];
          const qualityPercent = Math.round((product.quality_score ?? 0) * 100);
          const free = hasFreeTier(tiers);
          const price = getStartingPrice(tiers);

          return (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-lg border border-wiki-border hover:border-wiki-accent/30 transition-all"
            >
              {/* Rank badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-wiki-bg-alt border border-wiki-border shrink-0">
                <span className={`text-lg font-bold ${index < 3 ? 'text-wiki-accent' : 'text-wiki-text-muted'}`}>
                  {index + 1}
                </span>
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    href={`/wiki/${product.slug}`}
                    className="text-lg font-semibold text-wiki-text hover:text-wiki-accent transition-colors"
                  >
                    {product.name}
                  </Link>
                  {index === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      Top Pick
                    </span>
                  )}
                  {free && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <Check className="w-3 h-3" />
                      Free Tier
                    </span>
                  )}
                </div>

                {product.tagline && (
                  <p className="text-sm text-wiki-text-muted mb-2 line-clamp-2">{product.tagline}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-wiki-text-muted flex-wrap">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {product.feature_count} features
                  </span>
                  <span>Starting at {price}</span>
                  {qualityPercent > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-wiki-border overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${qualityPercent}%`,
                            backgroundColor:
                              qualityPercent >= 70 ? '#22c55e' : qualityPercent >= 40 ? '#eab308' : '#ef4444',
                          }}
                        />
                      </div>
                      <span>{qualityPercent}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 sm:mt-1">
                <Link
                  href={`/wiki/${product.slug}`}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-wiki-accent text-white hover:bg-wiki-accent-hover transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/alternatives/${product.slug}`}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-wiki-border text-wiki-text-muted hover:border-wiki-accent hover:text-wiki-accent transition-colors"
                >
                  Alternatives
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category link */}
      <div className="mt-8">
        <Link
          href={`/category/${entry.categorySlug}`}
          className="inline-flex items-center gap-1 text-sm wiki-link"
        >
          Browse all {categoryName} products <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Related best-of pages */}
      {relatedCategories.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mt-10">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">
            More Best-Of Lists
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/best/${cat.slug}`}
                className="p-3 rounded-lg border border-wiki-border hover:border-wiki-accent/30 hover:bg-wiki-bg-alt transition-all"
              >
                <div className="text-sm font-medium text-wiki-text">
                  Best {cat.category}
                </div>
                <div className="text-xs text-wiki-text-muted mt-0.5">
                  {cat.count} products compared
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reap CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <p className="text-wiki-text-muted mb-3">
          Need custom {categoryName.toLowerCase()} software?
        </p>
        <a
          href={`https://reaplabs.ai/?q=${encodeURIComponent(categoryName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-wiki-accent text-white font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
        >
          Analyze with Reap
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
