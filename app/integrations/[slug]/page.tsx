import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight, Plug } from 'lucide-react';
import {
  getProductLiteBySlug,
  getProductIntegrations,
  getProductsIntegratingWith,
  getProductSlugMap,
  getTopProductSlugs,
  slugifyCategory,
  type Product,
  type Integration,
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
  const product = await getProductLiteBySlug(params.slug);
  if (!product) return { title: 'Not Found' };

  const description = `See all tools that integrate with ${product.name}. Browse integrations by category and discover connected software.`;

  return {
    title: `${product.name} Integrations — Connected Tools & Apps`,
    description,
    alternates: { canonical: `/integrations/${params.slug}` },
    openGraph: {
      title: `${product.name} Integrations — Connected Tools & Apps | SaaSipedia`,
      description,
    },
  };
}

function groupByCategory(integrations: Integration[]): Record<string, Integration[]> {
  const groups: Record<string, Integration[]> = {};
  for (const i of integrations) {
    const cat = i.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(i);
  }
  return groups;
}

export default async function IntegrationsPage({ params }: PageProps) {
  const product = await getProductLiteBySlug(params.slug);
  if (!product) notFound();

  const [integrations, reverseProducts] = await Promise.all([
    getProductIntegrations(product.id),
    getProductsIntegratingWith(product.name, product.id, 50),
  ]);

  // Get slug map for cross-linking integrations to wiki pages
  const integrationNames = integrations.map((i) => i.name);
  const slugMap = await getProductSlugMap(integrationNames);

  const grouped = groupByCategory(integrations);
  const categoryNames = Object.keys(grouped).sort();

  // Group reverse products by category
  const reverseByCategory: Record<string, Product[]> = {};
  for (const p of reverseProducts) {
    const cat = p.category || 'Other';
    if (!reverseByCategory[cat]) reverseByCategory[cat] = [];
    reverseByCategory[cat].push(p);
  }
  const reverseCategoryNames = Object.keys(reverseByCategory).sort();

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: product.name, item: `https://saasipedia.com/wiki/${product.slug}` },
      { '@type': 'ListItem', position: 3, name: 'Integrations', item: `https://saasipedia.com/integrations/${product.slug}` },
    ],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/wiki/${product.slug}`} className="hover:text-wiki-accent transition-colors">
          {product.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Integrations</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          {product.name} Integrations
        </h1>
        <p className="text-wiki-text-muted">
          {integrations.length > 0 && (
            <>{product.name} connects with {integrations.length} tools. </>
          )}
          {reverseProducts.length > 0 && (
            <>{reverseProducts.length} products in our database integrate with {product.name}.</>
          )}
        </p>
      </div>

      {/* Outbound integrations */}
      {integrations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
            {product.name} Connects With
          </h2>

          {categoryNames.map((cat) => {
            const items = grouped[cat];
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-2">
                  {cat} ({items.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((integration) => {
                    const wikiSlug = slugMap[integration.name];
                    if (wikiSlug) {
                      return (
                        <Link
                          key={integration.id}
                          href={`/wiki/${wikiSlug}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
                        >
                          {integration.name}
                        </Link>
                      );
                    }
                    return (
                      <span
                        key={integration.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt text-sm text-wiki-text-muted"
                      >
                        {integration.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Reverse integrations */}
      {reverseProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
            Products That Integrate With {product.name}
          </h2>

          {reverseCategoryNames.map((cat) => {
            const products = reverseByCategory[cat];
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-2">
                  {cat} ({products.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/wiki/${p.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
                    >
                      <Plug className="w-3 h-3" />
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Empty state */}
      {integrations.length === 0 && reverseProducts.length === 0 && (
        <p className="text-wiki-text-muted py-8 text-center">
          No integration data available for {product.name} yet.
        </p>
      )}

      {/* Related links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/wiki/${product.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          View {product.name} details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/alternatives/${product.slug}`} className="inline-flex items-center gap-1 text-sm wiki-link">
          View {product.name} alternatives <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {product.normalized_category && (
          <Link href={`/category/${slugifyCategory(product.normalized_category)}`} className="inline-flex items-center gap-1 text-sm wiki-link">
            View all {product.normalized_category} products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Reap CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <p className="text-wiki-text-muted mb-3">
          Need custom integrations for {product.name}?
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
