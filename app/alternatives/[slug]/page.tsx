import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Layers, ArrowRight } from 'lucide-react';
import {
  getProductLiteBySlug,
  getAlternatives,
  getProductPricingTiers,
  slugifyCategory,
  type Product,
  type PricingTier,
} from '@/lib/data';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductLiteBySlug(params.slug);
  if (!product) return { title: 'Not Found' };

  const description = `Looking for ${product.name} alternatives? Compare ${product.category || 'similar'} tools with detailed feature, pricing, and integration analysis.`;

  return {
    title: `Best ${product.name} Alternatives — Top Competitors Compared`,
    description,
    alternates: { canonical: `/alternatives/${params.slug}` },
    openGraph: {
      title: `Best ${product.name} Alternatives — Top Competitors Compared | SaaSipedia`,
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
    const hasFreeTier = tiers.some(
      (t) => t.price_label?.toLowerCase().includes('free') || t.price_monthly === 0
    );
    return hasFreeTier ? 'Free' : 'Contact Sales';
  }
  return `$${prices[0]}/mo`;
}

export default async function AlternativesPage({ params }: PageProps) {
  const product = await getProductLiteBySlug(params.slug);
  if (!product || !product.category) notFound();

  const [alternatives, productPricing] = await Promise.all([
    getAlternatives(product.id, product.category, 20),
    getProductPricingTiers(product.id),
  ]);

  // Fetch pricing for all alternatives in parallel
  const altPricingMap: Record<string, PricingTier[]> = {};
  const pricingResults = await Promise.all(
    alternatives.map(async (alt) => {
      const tiers = await getProductPricingTiers(alt.id);
      return { id: alt.id, tiers };
    })
  );
  for (const r of pricingResults) {
    altPricingMap[r.id] = r.tiers;
  }

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: product.name, item: `https://saasipedia.com/wiki/${product.slug}` },
      { '@type': 'ListItem', position: 3, name: 'Alternatives', item: `https://saasipedia.com/alternatives/${product.slug}` },
    ],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/wiki/${product.slug}`} className="hover:text-wiki-accent transition-colors">
          {product.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Alternatives</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          Best Alternatives to {product.name}
        </h1>
        <p className="text-wiki-text-muted">
          {alternatives.length} {product.category} tools compared by features, pricing, and data quality.
        </p>
      </div>

      {/* Target product summary */}
      <div className="mb-8 p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Link href={`/wiki/${product.slug}`} className="font-semibold text-wiki-text hover:text-wiki-accent transition-colors">
              {product.name}
            </Link>
            {product.tagline && (
              <p className="text-sm text-wiki-text-muted mt-0.5">{product.tagline}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-wiki-text-muted">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {product.feature_count} features
            </span>
            <span>{getStartingPrice(productPricing)}</span>
          </div>
        </div>
      </div>

      {/* Alternatives table */}
      {alternatives.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wiki-border text-left">
                <th className="py-3 pr-4 font-semibold text-wiki-text">#</th>
                <th className="py-3 pr-4 font-semibold text-wiki-text">Product</th>
                <th className="py-3 pr-4 font-semibold text-wiki-text hidden sm:table-cell">Starting Price</th>
                <th className="py-3 pr-4 font-semibold text-wiki-text">Features</th>
                <th className="py-3 pr-4 font-semibold text-wiki-text hidden md:table-cell">Quality</th>
                <th className="py-3 font-semibold text-wiki-text">Compare</th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt, i) => {
                const qualityPercent = Math.round((alt.quality_score ?? 0) * 100);
                const altPricing = altPricingMap[alt.id] || [];
                const compareSlugs = [product.slug, alt.slug].sort().join('-vs-');
                return (
                  <tr key={alt.id} className="border-b border-wiki-border/50 hover:bg-wiki-bg-alt/50 transition-colors">
                    <td className="py-3 pr-4 text-wiki-text-muted">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/wiki/${alt.slug}`} className="font-medium text-wiki-text hover:text-wiki-accent transition-colors">
                        {alt.name}
                      </Link>
                      {alt.tagline && (
                        <p className="text-xs text-wiki-text-muted line-clamp-1 mt-0.5">{alt.tagline}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-wiki-text-muted hidden sm:table-cell">
                      {getStartingPrice(altPricing)}
                    </td>
                    <td className="py-3 pr-4 text-wiki-text-muted">{alt.feature_count}</td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      {qualityPercent > 0 && (
                        <div className="flex items-center gap-2 text-xs text-wiki-text-muted">
                          <div className="quality-bar w-12">
                            <div
                              className="quality-bar-fill"
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
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/compare/${compareSlugs}`}
                        className="text-xs text-wiki-accent hover:underline"
                      >
                        Compare
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-wiki-text-muted py-8 text-center">
          No alternatives found in the {product.category} category yet.
        </p>
      )}

      {/* Category link */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/category/${slugifyCategory(product.category)}`}
          className="inline-flex items-center gap-1 text-sm wiki-link"
        >
          View all {product.category} products <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/integrations/${product.slug}`}
          className="inline-flex items-center gap-1 text-sm wiki-link"
        >
          View {product.name} integrations <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Reap CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <p className="text-wiki-text-muted mb-3">
          Want to build your own {product.name} alternative?
        </p>
        <a
          href={`https://reaplabs.ai/?q=${encodeURIComponent(product.slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-wiki-accent text-white font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
        >
          Analyze it with Reap
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
