import Link from 'next/link';
import { ArrowRight, Layers, Tag, Shield, BookOpen, Search, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import {
  getCategories,
  getTotalProductCount,
  getTotalCategoryCount,
  getTopRankedByCategories,
  getRecentProducts,
} from '@/lib/data';
import type { Product } from '@/lib/data';
import { INDUSTRIES } from '@/lib/industries';

export const revalidate = 3600;

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 30) return `Updated ${days} days ago`;
  if (days < 365) return `Updated ${Math.floor(days / 30)} months ago`;
  return `Updated ${Math.floor(days / 365)} years ago`;
}

function IndustryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export default async function HomePage() {
  const [categories, productCount, categoryCount, recentProducts] = await Promise.all([
    getCategories(),
    getTotalProductCount(),
    getTotalCategoryCount(),
    getRecentProducts(8),
  ]);

  const topCategories = categories.slice(0, 12);

  // Fetch top 3 ranked products for each displayed category
  const topRanked = await getTopRankedByCategories(
    topCategories.map((c) => c.category),
    3
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-wiki-bg-alt border-b border-wiki-border">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-18 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-wiki-text mb-3">
            SaaSipedia
          </h1>
          <p className="text-lg sm:text-xl text-wiki-text-muted mb-2 max-w-2xl mx-auto">
            Every SaaS product, explained.
          </p>
          <p className="text-sm text-wiki-text-muted mb-8 max-w-xl mx-auto">
            Browse {productCount.toLocaleString()} products across {categoryCount} categories.
            Features, pricing, integrations — all independently verified.
          </p>

          <div className="flex justify-center">
            <SearchBar size="lg" placeholder="Search products, categories, features..." />
          </div>
        </div>
      </section>

      {/* How SaaSipedia is Different */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Browse by Industry</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              A CRM for healthcare is different from a CRM for construction. Find software
              that fits your industry and business type.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Complete Product Profiles</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              Every product page covers features, pricing tiers, integrations,
              and alternatives — everything you need to understand a tool before you buy.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Independently Verified</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              No vendor-submitted listings. Product data is extracted from public
              sources — pricing pages, docs, and feature lists — then verified by AI.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section id="industries" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-wiki-border">
        <h2 className="text-xl font-semibold text-wiki-text mb-2">
          Browse by industry
        </h2>
        <p className="text-sm text-wiki-text-muted mb-6">
          Explore software categories relevant to your field.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {INDUSTRIES.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industry/${industry.slug}`}
              className="wiki-card text-center group"
            >
              <IndustryIcon
                name={industry.icon}
                className="w-6 h-6 mx-auto mb-2 text-wiki-text-muted group-hover:text-wiki-accent transition-colors"
              />
              <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                {industry.name}
              </div>
              <div className="text-xs text-wiki-text-muted mt-1">
                {industry.categoryMappings.length} software categories
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Updated */}
      {recentProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-wiki-border">
          <h2 className="text-xl font-semibold text-wiki-text mb-2">
            Recently updated
          </h2>
          <p className="text-sm text-wiki-text-muted mb-6">
            The latest product profiles to be added or refreshed.
          </p>

          <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
            {recentProducts.map((product: Product) => (
              <Link
                key={product.slug}
                href={`/wiki/${product.slug}`}
                className="wiki-card group min-w-[200px] md:min-w-0 flex-shrink-0"
              >
                <div className="text-sm font-bold text-wiki-text group-hover:text-wiki-accent transition-colors mb-1">
                  {product.name}
                </div>
                {product.category && (
                  <div className="text-xs text-wiki-text-muted mb-2">
                    {product.category}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {product.feature_count != null && product.feature_count > 0 && (
                    <span className="text-[10px] font-medium bg-blue-50 text-wiki-accent px-1.5 py-0.5 rounded">
                      {product.feature_count} features
                    </span>
                  )}
                  {product.last_scraped_at && (
                    <span className="text-[10px] text-wiki-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(product.last_scraped_at)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Software Categories with Top Products */}
      {topCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-wiki-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-wiki-text">Software categories</h2>
              <p className="text-sm text-wiki-text-muted mt-1">Explore products by category. Each profile includes features, pricing, and integrations.</p>
            </div>
            <Link href="/categories" className="wiki-link text-sm flex items-center gap-1 shrink-0">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topCategories.map((cat) => {
              const top = topRanked[cat.category] || [];
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="wiki-card group"
                >
                  <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors mb-1">
                    {cat.category}
                  </div>
                  <div className="text-xs text-wiki-text-muted mb-2">
                    {cat.count} products
                  </div>
                  {top.length > 0 && (
                    <div className="hidden sm:block space-y-0.5">
                      {top.map((p, i) => (
                        <div key={p.slug} className="text-xs text-wiki-text-muted flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-wiki-accent w-3 text-right">{i + 1}</span>
                          <span className="truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
