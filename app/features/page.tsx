import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { getFeatureTaxonomy } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse by Feature Category',
  description:
    'Explore SaaS products by feature category. Find tools with AI, analytics, collaboration, and more.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Browse SaaS Features by Category | SaaSipedia',
    description:
      'Explore SaaS products by feature category. Find tools with AI, analytics, collaboration, and more.',
  },
};

export default async function FeaturesIndexPage() {
  const taxonomy = await getFeatureTaxonomy();

  const totalFeatures = taxonomy.reduce((sum, t) => sum + t.featureCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Features</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-2">Browse by Feature Category</h1>
      <p className="text-wiki-text-muted mb-8">
        {totalFeatures.toLocaleString()} features across {taxonomy.length} categories.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {taxonomy.map((cat) => (
          <Link
            key={cat.slug}
            href={`/features/${cat.slug}`}
            className="wiki-card group"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
                {cat.category}
              </h2>
              <span className="text-xs text-wiki-text-muted bg-wiki-bg-alt px-2 py-0.5 rounded-full border border-wiki-border">
                {cat.productCount} products
              </span>
            </div>
            <p className="text-sm text-wiki-text-muted">
              {cat.featureCount} features
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
