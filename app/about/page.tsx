import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight, Database, Search, GitCompare, Layers } from 'lucide-react';
import { getTotalProductCount, getTotalFeatureCount, getTotalCategoryCount } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About SaaSipedia — The SaaS Encyclopedia',
  description:
    'SaaSipedia is a free, open encyclopedia of business software. Browse features, compare pricing, and discover alternatives across hundreds of SaaS products.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About SaaSipedia — The SaaS Encyclopedia',
    description:
      'SaaSipedia is a free, open encyclopedia of business software. Browse features, compare pricing, and discover alternatives across hundreds of SaaS products.',
  },
};

export default async function AboutPage() {
  const [productCount, featureCount, categoryCount] = await Promise.all([
    getTotalProductCount(),
    getTotalFeatureCount(),
    getTotalCategoryCount(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-6">About SaaSipedia</h1>

      <div className="prose prose-wiki max-w-none space-y-6 text-wiki-text leading-relaxed">
        <p>
          SaaSipedia is a free, open encyclopedia of business software. We catalog features,
          pricing, and integrations across hundreds of SaaS products so you can make informed
          decisions without wading through marketing pages.
        </p>

        <p>
          Every product page includes a detailed feature breakdown by category, current pricing
          tiers, integration lists with cross-links, and comparisons to alternatives in the
          same category.
        </p>

        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          What You Can Do
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Search className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1">Search Products</h3>
            <p className="text-sm text-wiki-text-muted">
              Find any SaaS tool by name, category, or feature. Full-text search across
              the entire database.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <GitCompare className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1">Compare Side by Side</h3>
            <p className="text-sm text-wiki-text-muted">
              Pick any two products and compare features, pricing, and integrations in
              a detailed breakdown.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Layers className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1">Browse by Feature</h3>
            <p className="text-sm text-wiki-text-muted">
              Explore products by feature category — AI, analytics, collaboration,
              automation, and more.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Database className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1">Discover Alternatives</h3>
            <p className="text-sm text-wiki-text-muted">
              Every product page links to alternatives in the same category, ranked
              by data quality.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          By the Numbers
        </h2>

        <div className="grid grid-cols-3 gap-4 not-prose">
          <div className="text-center p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <div className="text-2xl font-bold text-wiki-accent">{productCount.toLocaleString()}</div>
            <div className="text-sm text-wiki-text-muted mt-1">Products</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <div className="text-2xl font-bold text-wiki-accent">{featureCount.toLocaleString()}</div>
            <div className="text-sm text-wiki-text-muted mt-1">Features</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <div className="text-2xl font-bold text-wiki-accent">{categoryCount.toLocaleString()}</div>
            <div className="text-sm text-wiki-text-muted mt-1">Categories</div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          How It Works
        </h2>

        <p>
          Product data is collected from public sources — pricing pages, feature lists,
          documentation, and integration directories. AI extraction identifies and
          categorizes features, detects pricing tiers, and maps integration ecosystems.
          Data quality scores reflect how complete and current each product profile is.
        </p>

        <p>
          SaaSipedia is built and maintained by{' '}
          <a
            href="https://reaplabs.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-link"
          >
            ReapLabs
          </a>
          , an AI consulting studio that helps businesses replace expensive SaaS with
          custom-built alternatives.
        </p>
      </div>

      {/* Navigation links */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/categories" className="inline-flex items-center gap-1 text-sm wiki-link">
          Browse categories <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href="/features" className="inline-flex items-center gap-1 text-sm wiki-link">
          Browse features <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href="/pricing" className="inline-flex items-center gap-1 text-sm wiki-link">
          Pricing directory <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
