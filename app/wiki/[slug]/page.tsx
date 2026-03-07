import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ExternalLink, Tag, Sparkles, Crown, Hammer, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import MobileToc from '@/components/MobileToc';
import CostCalculator from '@/components/CostCalculator';
import BuildScore from '@/components/BuildScore';
import ShipYardCTA from '@/components/ShipYardCTA';
import CollapsibleFeatureCategory from '@/components/CollapsibleFeatureCategory';
import {
  getProductBySlug,
  getRelatedProducts,
  getProductsWithFeatureCategory,
  getProductSlugMap,
  getTopProductSlugs,
  calculateBuildScore,
  slugifyCategory,
  type Feature,
  type Product,
} from '@/lib/data';

export async function generateStaticParams() {
  const slugs = await getTopProductSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Not Found' };

  const description =
    product.description || product.tagline || `Explore ${product.name} features, pricing, and integrations.`;

  return {
    title: `${product.name} — Features, Pricing & Integrations`,
    description,
    alternates: {
      canonical: `/wiki/${params.slug}`,
    },
    openGraph: {
      title: `${product.name} — Features, Pricing & Integrations | SaaSipedia`,
      description,
      type: 'article',
    },
  };
}

// Group features by category
function groupFeatures(features: Feature[]): Record<string, Feature[]> {
  const groups: Record<string, Feature[]> = {};
  for (const f of features) {
    const cat = f.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  }
  return groups;
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const featureGroups = groupFeatures(product.features);
  const featureCategoryNames = Object.keys(featureGroups).sort();
  const buildScore = calculateBuildScore(product);

  // Fetch related products and integration slug map in parallel
  const integrationNames = product.integrations.map((i) => i.name);
  const [related, integrationSlugMap] = await Promise.all([
    product.normalized_category
      ? getRelatedProducts(product.normalized_category, product.slug, 6)
      : Promise.resolve([] as Product[]),
    getProductSlugMap(integrationNames),
  ]);

  // Build feature category cross-links (fetch in parallel)
  const crossLinkPromises = featureCategoryNames.slice(0, 8).map(async (cat) => {
    const products = await getProductsWithFeatureCategory(cat, product.id, 3);
    return { category: cat, products };
  });
  const crossLinks = await Promise.all(crossLinkPromises);
  const crossLinkMap: Record<string, Product[]> = {};
  for (const cl of crossLinks) {
    if (cl.products.length > 0) crossLinkMap[cl.category] = cl.products;
  }

  // Build ToC sections
  const tocSections: { id: string; label: string; indent?: boolean }[] = [];
  if (product.description || product.tagline) {
    tocSections.push({ id: 'overview', label: 'Overview' });
  }
  if (product.features.length > 0) {
    tocSections.push({ id: 'features', label: 'Features' });
    for (const cat of featureCategoryNames) {
      tocSections.push({
        id: `features-${slugifyCategory(cat)}`,
        label: cat,
        indent: true,
      });
    }
  }
  tocSections.push({ id: 'shipyard', label: 'Build Your Own' });
  if (product.pricing_tiers.length > 0) {
    tocSections.push({ id: 'pricing', label: 'Pricing' });
  }
  tocSections.push({ id: 'cost-calculator', label: 'Cost Calculator' });
  if (product.integrations.length > 0) {
    tocSections.push({ id: 'integrations', label: 'Integrations' });
  }
  if (related.length > 0) {
    tocSections.push({ id: 'related', label: 'Related Products' });
  }

  // Structured data: SoftwareApplication + BreadcrumbList
  const lowestPrice = product.pricing_tiers
    .map((t) => t.price_monthly)
    .filter((p): p is number => p != null && p > 0)
    .sort((a, b) => a - b)[0];

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description || product.tagline || undefined,
    applicationCategory: product.normalized_category || 'BusinessApplication',
    operatingSystem: 'Web',
    url: product.url || `https://saasipedia.com/wiki/${product.slug}`,
    ...(lowestPrice != null && {
      offers: {
        '@type': 'Offer',
        price: lowestPrice,
        priceCurrency: 'USD',
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://saasipedia.com',
      },
      ...(product.normalized_category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.normalized_category,
              item: `https://saasipedia.com/category/${slugifyCategory(product.normalized_category)}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `https://saasipedia.com/wiki/${product.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.name,
              item: `https://saasipedia.com/wiki/${product.slug}`,
            },
          ]),
    ],
  };

  const jsonLdString = JSON.stringify([softwareJsonLd, breadcrumbJsonLd]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.normalized_category && (
          <>
            <Link
              href={`/category/${slugifyCategory(product.normalized_category)}`}
              className="hover:text-wiki-accent transition-colors"
            >
              {product.normalized_category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-wiki-text">{product.name}</span>
      </nav>

      {/* Mobile Table of Contents */}
      <MobileToc sections={tocSections} />

      <div className="flex gap-8">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          {/* Title area */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-wiki-text mb-1">
              {product.name}
            </h1>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-wiki-accent hover:text-wiki-accent-hover transition-colors mb-1"
              >
                {product.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-2">
              {product.normalized_category && (
                <Link
                  href={`/category/${slugifyCategory(product.normalized_category)}`}
                  className="wiki-badge inline-block"
                >
                  {product.normalized_category}
                </Link>
              )}
              <BuildScore buildScore={buildScore} />
            </div>

            {product.tagline && (
              <p className="text-lg text-wiki-text-muted mt-2">{product.tagline}</p>
            )}

            <Link
              href={`/wiki/${product.slug}/replace`}
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg border border-wiki-accent
                text-wiki-accent text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <Hammer className="w-4 h-4" />
              How to Replace {product.name}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Compare with alternatives */}
            {related.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-sm text-wiki-text-muted">Compare:</span>
                {related.slice(0, 3).map((alt) => (
                  <Link
                    key={alt.slug}
                    href={`/compare/${[product.slug, alt.slug].sort().join('-vs-')}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-wiki-border text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
                  >
                    vs {alt.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          {product.description && (
            <section id="overview" className="wiki-section">
              <h2 className="text-2xl font-semibold text-wiki-text mb-3 pb-2 border-b border-wiki-border">
                Overview
              </h2>
              <div className="text-wiki-text leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </section>
          )}

          {/* Features */}
          {product.features.length > 0 && (
            <section id="features" className="wiki-section">
              <h2 className="text-2xl font-semibold text-wiki-text mb-1 pb-2 border-b border-wiki-border">
                Features
              </h2>
              <p className="text-sm text-wiki-text-muted mb-4">
                {product.features.length} features across {featureCategoryNames.length} categories
              </p>

              {featureCategoryNames.map((cat) => {
                const catFeatures = featureGroups[cat];
                const alsoIn = crossLinkMap[cat];

                return (
                  <div
                    key={cat}
                    id={`features-${slugifyCategory(cat)}`}
                    className="mb-6 scroll-mt-20"
                  >
                    <h3 className="text-lg font-semibold text-wiki-text mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-wiki-indigo" />
                      {cat}
                      <span className="text-sm font-normal text-wiki-text-muted">
                        ({catFeatures.length})
                      </span>
                    </h3>

                    <CollapsibleFeatureCategory featureCount={catFeatures.length}>
                      <div className="space-y-2">
                        {catFeatures.map((feature) => (
                          <div
                            key={feature.id}
                            className="pl-4 border-l-2 border-wiki-border py-1.5"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-wiki-text text-sm">
                                {feature.name}
                              </span>
                              {feature.is_ai_powered && (
                                <span className="wiki-badge-ai">
                                  <Sparkles className="w-3 h-3 mr-0.5" />
                                  AI
                                </span>
                              )}
                              {feature.is_premium && (
                                <span className="wiki-badge-premium">
                                  <Crown className="w-3 h-3 mr-0.5" />
                                  Premium
                                </span>
                              )}
                            </div>
                            {feature.description && (
                              <p className="text-sm text-wiki-text-muted mt-0.5">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleFeatureCategory>

                    {/* Also in cross-link */}
                    {alsoIn && alsoIn.length > 0 && (
                      <div className="mt-2 pl-4 text-xs text-wiki-text-muted">
                        Also in:{' '}
                        {alsoIn.map((p, i) => (
                          <span key={p.id}>
                            {i > 0 && ', '}
                            {p.slug ? (
                              <Link href={`/wiki/${p.slug}`} className="wiki-link">
                                {p.name}
                              </Link>
                            ) : (
                              <span>{p.name}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* ShipYard CTA */}
          <ShipYardCTA productSlug={product.slug} productName={product.name} />

          {/* Pricing */}
          {product.pricing_tiers.length > 0 && (
            <section id="pricing" className="wiki-section">
              <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
                Pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {product.pricing_tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-lg border p-5 ${
                      tier.is_popular
                        ? 'border-wiki-accent bg-blue-50/50 ring-1 ring-wiki-accent/20'
                        : 'border-wiki-border bg-wiki-bg-alt'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-wiki-text">{tier.name}</h3>
                      {tier.is_popular && (
                        <span className="text-xs font-medium text-wiki-accent bg-blue-100 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      {tier.price_label ? (
                        <span className="text-lg font-bold text-wiki-text">
                          {tier.price_label}
                        </span>
                      ) : tier.price_monthly != null ? (
                        <div>
                          <span className="text-2xl font-bold text-wiki-text">
                            ${tier.price_monthly}
                          </span>
                          <span className="text-sm text-wiki-text-muted">/mo</span>
                          {tier.price_annual != null && (
                            <div className="text-xs text-wiki-text-muted mt-0.5">
                              ${tier.price_annual}/mo billed annually
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-wiki-text">
                          Contact Sales
                        </span>
                      )}
                    </div>

                    {tier.features && tier.features.length > 0 && (
                      <ul className="space-y-1.5 text-sm text-wiki-text-muted">
                        {tier.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cost Calculator */}
          <CostCalculator
            productName={product.name}
            featureCount={product.features.length}
            buildScore={buildScore.score}
            lowestPaidPrice={lowestPrice ?? null}
            productSlug={product.slug}
          />

          {/* Integrations */}
          {product.integrations.length > 0 && (
            <section id="integrations" className="wiki-section">
              <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
                Integrations
              </h2>
              <p className="text-sm text-wiki-text-muted mb-4">
                {product.integrations.length} known integrations
              </p>

              <div className="flex flex-wrap gap-2">
                {product.integrations.map((integration) => {
                  const slug = integrationSlugMap[integration.name];
                  if (slug) {
                    return (
                      <Link
                        key={integration.id}
                        href={`/wiki/${slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-wiki-border
                          bg-wiki-bg-alt text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent
                          transition-all"
                      >
                        {integration.name}
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={integration.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-wiki-border
                        bg-wiki-bg-alt text-sm text-wiki-text-muted"
                    >
                      {integration.name}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Products */}
          {related.length > 0 && (
            <section id="related" className="wiki-section">
              <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

        </article>

        {/* Sidebar — Table of Contents */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-wiki-text-muted mb-3">
              On this page
            </h4>
            <nav className="space-y-0.5">
              {tocSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`wiki-toc-link ${section.indent ? 'pl-4 text-xs' : ''}`}
                >
                  {section.label}
                </a>
              ))}
            </nav>

            {/* Quick stats */}
            <div className="mt-6 pt-4 border-t border-wiki-border space-y-2 text-xs text-wiki-text-muted">
              <div className="flex items-center justify-between">
                <span>Features</span>
                <span className="font-medium text-wiki-text">
                  {product.features.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pricing tiers</span>
                <span className="font-medium text-wiki-text">
                  {product.pricing_tiers.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Integrations</span>
                <span className="font-medium text-wiki-text">
                  {product.integrations.length}
                </span>
              </div>
              {product.quality_score > 0 && (
                <div className="flex items-center justify-between">
                  <span>Data quality</span>
                  <span className="font-medium text-wiki-text">
                    {Math.round(product.quality_score * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Cross-links */}
            <div className="mt-4 pt-4 border-t border-wiki-border space-y-1.5">
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs wiki-link"
                >
                  Visit website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Link
                href={`/wiki/${product.slug}/replace`}
                className="block text-xs wiki-link font-medium"
              >
                Replacement guide
              </Link>
              {related.length > 0 && (
                <Link
                  href={`/compare/${[product.slug, related[0].slug].sort().join('-vs-')}`}
                  className="block text-xs wiki-link"
                >
                  Compare with {related[0].name}
                </Link>
              )}
              <Link
                href={`/alternatives/${product.slug}`}
                className="block text-xs wiki-link"
              >
                View alternatives
              </Link>
              <Link
                href={`/integrations/${product.slug}`}
                className="block text-xs wiki-link"
              >
                View integrations
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
