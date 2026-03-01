import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import {
  getFeatureTaxonomy,
  getProductsByFeatureTaxonomy,
  deslugifyCategory,
} from '@/lib/data';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const taxonomy = await getFeatureTaxonomy();
  const match = taxonomy.find((t) => t.slug === params.slug);
  if (!match) return { title: 'Not Found' };

  const description = `Discover SaaS products with ${match.category} features. ${match.productCount} products and ${match.featureCount} features compared.`;

  return {
    title: `${match.category} — SaaS Products with These Features`,
    description,
    alternates: { canonical: `/features/${params.slug}` },
    openGraph: {
      title: `${match.category} Features — SaaS Products | SaaSipedia`,
      description,
    },
  };
}

export default async function FeatureCategoryPage({ params }: PageProps) {
  const taxonomy = await getFeatureTaxonomy();
  let match = taxonomy.find((t) => t.slug === params.slug);

  if (!match) {
    const deslugified = deslugifyCategory(params.slug);
    match = taxonomy.find(
      (t) => t.category.toLowerCase() === deslugified.toLowerCase()
    );
    if (!match) notFound();
  }

  const products = await getProductsByFeatureTaxonomy(match.category, 50);

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://saasipedia.com/features' },
      { '@type': 'ListItem', position: 3, name: match.category, item: `https://saasipedia.com/features/${match.slug}` },
    ],
  };
  const breadcrumbJsonLd = JSON.stringify(breadcrumbData);

  const relatedCategories = taxonomy
    .filter((t) => t.slug !== match!.slug)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/features" className="hover:text-wiki-accent transition-colors">Features</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{match.category}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">{match.category}</h1>
        <p className="text-wiki-text-muted">
          {match.productCount} products with {match.featureCount} features in this category.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-wiki-text-muted py-8 text-center">
          No products found with {match.category} features.
        </p>
      )}

      {relatedCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
            Related Feature Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/features/${cat.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
              >
                {cat.category}
                <span className="text-wiki-text-muted text-xs">({cat.productCount})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Link href="/features" className="inline-flex items-center gap-1 text-sm wiki-link">
          View all feature categories <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
