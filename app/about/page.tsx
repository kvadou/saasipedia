import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight, Database, Search, GitCompare, Layers, BarChart3, Shield, Globe } from 'lucide-react';
import { getTotalProductCount, getTotalFeatureCount, getTotalCategoryCount } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About SaaSipedia — How Our Rankings Work',
  description:
    'SaaSipedia ranks software by actual market share and adoption — not paid placement. Learn how our AI-curated rankings differ from traditional review sites.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About SaaSipedia — How Our Rankings Work',
    description:
      'SaaSipedia ranks software by actual market share and adoption — not paid placement. Learn how our AI-curated rankings differ from traditional review sites.',
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

      <h1 className="text-3xl font-bold text-wiki-text mb-3">About SaaSipedia</h1>
      <p className="text-lg text-wiki-text-muted mb-8">
        Software rankings based on real market share — not who pays the most.
      </p>

      <div className="prose prose-wiki max-w-none space-y-6 text-wiki-text leading-relaxed">
        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          Why SaaSipedia Exists
        </h2>

        <p>
          On most review sites, software companies pay to rank higher. The product at #1
          isn&apos;t the most widely used — it&apos;s the one with the biggest ad budget.
          Sponsored placements, pay-per-click listings, and vendor-submitted data make it
          hard to know what businesses actually use.
        </p>

        <p>
          SaaSipedia takes a different approach. We rank products by actual market share and
          adoption. When you browse CRM software, Salesforce is #1 because it&apos;s the most
          widely used CRM in the world — not because they paid us.
        </p>

        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          How Rankings Work
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose mb-6">
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <BarChart3 className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1 text-sm">Market Share Rankings</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              Products are ranked by global adoption within each category. The most widely
              used tools appear first. We use AI analysis of market data to determine
              actual usage, not review counts or vendor claims.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Globe className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1 text-sm">Industry-Specific Views</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              The best CRM for healthcare is different from the best CRM for
              construction. Our industry pages re-rank products based on adoption
              within specific industries and business types.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Shield className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1 text-sm">Independent Data</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              Product data is extracted from public sources — pricing pages, documentation,
              and feature lists. No vendor-submitted listings. No sponsored placements.
              AI extraction ensures consistency.
            </p>
          </div>
        </div>

        <p>
          Each product is classified as a <strong>Leader</strong> (top 3-5 by market share),
          <strong> Challenger</strong> (strong but less dominant), or <strong>Niche</strong> (specialized
          or smaller players). You can filter by position on any category page.
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
              {' '}{productCount.toLocaleString()} products.
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
              automation, and {categoryCount}+ more.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <Database className="w-5 h-5 text-wiki-accent mb-2" />
            <h3 className="font-semibold text-wiki-text mb-1">Discover Alternatives</h3>
            <p className="text-sm text-wiki-text-muted">
              Every product page links to alternatives in the same category, ranked
              by market position.
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
            <div className="text-sm text-wiki-text-muted mt-1">Features Tracked</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt">
            <div className="text-2xl font-bold text-wiki-accent">{categoryCount.toLocaleString()}</div>
            <div className="text-sm text-wiki-text-muted mt-1">Categories</div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-wiki-text mt-8 mb-4 pb-2 border-b border-wiki-border">
          Built By
        </h2>

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
          , an AI consulting studio that helps businesses analyze and optimize their
          software stack.
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
