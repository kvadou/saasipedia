import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight, Check, X } from 'lucide-react';
import {
  getProductBySlug,
  slugifyCategory,
  type ProductWithRelations,
} from '@/lib/data';

export const revalidate = 3600;

interface PageProps {
  params: { slugs: string };
}

function parseSlugs(raw: string): [string, string] | null {
  const parts = raw.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseSlugs(params.slugs);
  if (!parsed) return { title: 'Not Found' };

  const [slugA, slugB] = parsed;
  const [a, b] = await Promise.all([
    getProductBySlug(slugA),
    getProductBySlug(slugB),
  ]);
  if (!a || !b) return { title: 'Not Found' };

  const description = `Compare ${a.name} vs ${b.name} — side-by-side feature, pricing, and integration analysis.`;

  return {
    title: `${a.name} vs ${b.name} — Feature Comparison`,
    description,
    alternates: { canonical: `/compare/${params.slugs}` },
    openGraph: {
      title: `${a.name} vs ${b.name} — Feature Comparison | SaaSipedia`,
      description,
    },
  };
}

function getStartingPrice(product: ProductWithRelations): string {
  const prices = product.pricing_tiers
    .map((t) => t.price_monthly)
    .filter((p): p is number => p != null && p > 0)
    .sort((a, b) => a - b);
  if (prices.length === 0) {
    const hasFreeTier = product.pricing_tiers.some(
      (t) => t.price_label?.toLowerCase().includes('free') || t.price_monthly === 0
    );
    return hasFreeTier ? 'Free' : 'Contact Sales';
  }
  return `$${prices[0]}/mo`;
}

export default async function ComparePage({ params }: PageProps) {
  const parsed = parseSlugs(params.slugs);
  if (!parsed) notFound();

  const [slugA, slugB] = parsed;

  // Enforce canonical ordering (alphabetical)
  if (slugA > slugB) {
    redirect(`/compare/${slugB}-vs-${slugA}`);
  }

  const [productA, productB] = await Promise.all([
    getProductBySlug(slugA),
    getProductBySlug(slugB),
  ]);

  if (!productA || !productB) notFound();

  // Feature comparison
  const featureNamesA = new Set(productA.features.map((f) => f.name.toLowerCase()));
  const featureNamesB = new Set(productB.features.map((f) => f.name.toLowerCase()));

  const sharedFeatures = productA.features.filter((f) =>
    featureNamesB.has(f.name.toLowerCase())
  );

  const uniqueA = productA.features.filter(
    (f) => !featureNamesB.has(f.name.toLowerCase())
  );
  const uniqueB = productB.features.filter(
    (f) => !featureNamesA.has(f.name.toLowerCase())
  );

  // Feature categories that appear in both
  const categoriesA = productA.features.map((f) => f.category || 'General');
  const categoriesB = productB.features.map((f) => f.category || 'General');
  const allCategories = Array.from(
    new Set(categoriesA.concat(categoriesB))
  ).sort();

  // Integration comparison
  const integNamesA = new Set(productA.integrations.map((i) => i.name.toLowerCase()));
  const integNamesB = new Set(productB.integrations.map((i) => i.name.toLowerCase()));
  const sharedIntegrations = productA.integrations.filter((i) =>
    integNamesB.has(i.name.toLowerCase())
  );

  // AI feature counts
  const aiCountA = productA.features.filter((f) => f.is_ai_powered).length;
  const aiCountB = productB.features.filter((f) => f.is_ai_powered).length;

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: productA.name, item: `https://saasipedia.com/wiki/${productA.slug}` },
      { '@type': 'ListItem', position: 3, name: `vs ${productB.name}`, item: `https://saasipedia.com/compare/${params.slugs}` },
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
        <Link href={`/wiki/${productA.slug}`} className="hover:text-wiki-accent transition-colors">
          {productA.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">vs {productB.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          {productA.name} vs {productB.name}
        </h1>
        <p className="text-wiki-text-muted">
          Side-by-side comparison of features, pricing, and integrations.
        </p>
      </div>

      {/* Quick Verdict */}
      <div className="mb-8 p-4 rounded-lg bg-wiki-bg-alt border border-wiki-border">
        <h2 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-2">Quick Verdict</h2>
        <p className="text-wiki-text leading-relaxed">
          <strong>{productA.name}</strong> offers {productA.features.length > productB.features.length ? 'more features' : productA.features.length < productB.features.length ? 'fewer features' : 'the same number of features'} ({productA.features.length} vs {productB.features.length}){productA.integrations.length !== productB.integrations.length ? ` and ${productA.integrations.length > productB.integrations.length ? 'more' : 'fewer'} integrations (${productA.integrations.length} vs ${productB.integrations.length})` : ''}.
          {' '}{getStartingPrice(productA) !== getStartingPrice(productB) ? (
            <>Starting price: {productA.name} at {getStartingPrice(productA)} vs {productB.name} at {getStartingPrice(productB)}.</>
          ) : (
            <>Both start at {getStartingPrice(productA)}.</>
          )}
          {' '}<strong>{productA.name}</strong> has {uniqueA.length} unique features while <strong>{productB.name}</strong> has {uniqueB.length} unique features, with {sharedFeatures.length} features in common.
        </p>
      </div>

      {/* Quick Comparison Table */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wiki-border">
              <th className="py-3 pr-4 text-left font-semibold text-wiki-text w-1/3"></th>
              <th className="py-3 px-4 text-left font-semibold text-wiki-text w-1/3 text-sm sm:text-base">
                <Link href={`/wiki/${productA.slug}`} className="hover:text-wiki-accent transition-colors">
                  {productA.name}
                </Link>
              </th>
              <th className="py-3 pl-4 text-left font-semibold text-wiki-text w-1/3 text-sm sm:text-base">
                <Link href={`/wiki/${productB.slug}`} className="hover:text-wiki-accent transition-colors">
                  {productB.name}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Category</td>
              <td className="py-3 px-4">
                {productA.normalized_category ? (
                  <Link href={`/category/${slugifyCategory(productA.normalized_category)}`} className="text-wiki-text hover:text-wiki-accent transition-colors">
                    {productA.normalized_category}
                  </Link>
                ) : <span className="text-wiki-text-muted">—</span>}
              </td>
              <td className="py-3 pl-4">
                {productB.normalized_category ? (
                  <Link href={`/category/${slugifyCategory(productB.normalized_category)}`} className="text-wiki-text hover:text-wiki-accent transition-colors">
                    {productB.normalized_category}
                  </Link>
                ) : <span className="text-wiki-text-muted">—</span>}
              </td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Total Features</td>
              <td className="py-3 px-4 text-wiki-text">{productA.features.length}</td>
              <td className="py-3 pl-4 text-wiki-text">{productB.features.length}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">AI-Powered Features</td>
              <td className="py-3 px-4 text-wiki-text">{aiCountA}</td>
              <td className="py-3 pl-4 text-wiki-text">{aiCountB}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Starting Price</td>
              <td className="py-3 px-4 text-wiki-text">{getStartingPrice(productA)}</td>
              <td className="py-3 pl-4 text-wiki-text">{getStartingPrice(productB)}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Pricing Tiers</td>
              <td className="py-3 px-4 text-wiki-text">{productA.pricing_tiers.length}</td>
              <td className="py-3 pl-4 text-wiki-text">{productB.pricing_tiers.length}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Integrations</td>
              <td className="py-3 px-4 text-wiki-text">{productA.integrations.length}</td>
              <td className="py-3 pl-4 text-wiki-text">{productB.integrations.length}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Shared Features</td>
              <td className="py-3 px-4 text-wiki-text" colSpan={2}>{sharedFeatures.length}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Shared Integrations</td>
              <td className="py-3 px-4 text-wiki-text" colSpan={2}>{sharedIntegrations.length}</td>
            </tr>
            <tr className="border-b border-wiki-border/50">
              <td className="py-3 pr-4 text-wiki-text-muted">Data Quality</td>
              <td className="py-3 px-4 text-wiki-text">
                {Math.round((productA.quality_score ?? 0) * 100)}%
              </td>
              <td className="py-3 pl-4 text-wiki-text">
                {Math.round((productB.quality_score ?? 0) * 100)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feature-by-Category Comparison */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
          Feature Comparison by Category
        </h2>

        {allCategories.map((cat) => {
          const aFeatures = productA.features.filter(
            (f) => (f.category || 'General') === cat
          );
          const bFeatures = productB.features.filter(
            (f) => (f.category || 'General') === cat
          );

          // Collect all unique feature names in this category
          const allNames = Array.from(
            new Set([
              ...aFeatures.map((f) => f.name),
              ...bFeatures.map((f) => f.name),
            ])
          )
            .sort()
            .slice(0, 15);

          const aNameSet = new Set(aFeatures.map((f) => f.name.toLowerCase()));
          const bNameSet = new Set(bFeatures.map((f) => f.name.toLowerCase()));

          return (
            <div key={cat} className="mb-6">
              <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-2">
                {cat} ({aFeatures.length} vs {bFeatures.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-wiki-border/50">
                      <th className="py-2 pr-4 text-left text-wiki-text-muted font-normal">Feature</th>
                      <th className="py-2 px-4 text-center text-wiki-text-muted font-normal w-16 sm:w-24 text-xs sm:text-sm truncate max-w-[64px] sm:max-w-none">{productA.name}</th>
                      <th className="py-2 pl-4 text-center text-wiki-text-muted font-normal w-16 sm:w-24 text-xs sm:text-sm truncate max-w-[64px] sm:max-w-none">{productB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allNames.map((name) => (
                      <tr key={name} className="border-b border-wiki-border/30">
                        <td className="py-1.5 pr-4 text-wiki-text text-sm">{name}</td>
                        <td className="py-1.5 px-4 text-center">
                          {aNameSet.has(name.toLowerCase()) ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-1.5 pl-4 text-center">
                          {bNameSet.has(name.toLowerCase()) ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-red-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      {/* Unique Features */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
          Unique Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-3">
              Only in {productA.name} ({uniqueA.length})
            </h3>
            <div className="space-y-1">
              {uniqueA.slice(0, 20).map((f) => (
                <div key={f.id} className="text-sm text-wiki-text py-1 border-b border-wiki-border/20">
                  {f.name}
                </div>
              ))}
              {uniqueA.length > 20 && (
                <p className="text-xs text-wiki-text-muted mt-2">
                  + {uniqueA.length - 20} more unique features
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-3">
              Only in {productB.name} ({uniqueB.length})
            </h3>
            <div className="space-y-1">
              {uniqueB.slice(0, 20).map((f) => (
                <div key={f.id} className="text-sm text-wiki-text py-1 border-b border-wiki-border/20">
                  {f.name}
                </div>
              ))}
              {uniqueB.length > 20 && (
                <p className="text-xs text-wiki-text-muted mt-2">
                  + {uniqueB.length - 20} more unique features
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/wiki/${productA.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          View {productA.name} details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/wiki/${productB.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          View {productB.name} details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/alternatives/${productA.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          {productA.name} alternatives <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/alternatives/${productB.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          {productB.name} alternatives <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Reap CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <p className="text-wiki-text-muted mb-3">
          Want to build your own alternative to {productA.name} or {productB.name}?
        </p>
        <a
          href={`https://reaplabs.ai/?q=${encodeURIComponent(productA.slug)}`}
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
