import Link from 'next/link';
import { ArrowRight, Layers, Tag, Shield, BarChart3, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import {
  getCategories,
  getTotalProductCount,
  getTotalCategoryCount,
  getTopRankedByCategories,
} from '@/lib/data';
import { INDUSTRIES } from '@/lib/industries';

export const revalidate = 3600;

function IndustryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export default async function HomePage() {
  const [categories, productCount, categoryCount] = await Promise.all([
    getCategories(),
    getTotalProductCount(),
    getTotalCategoryCount(),
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
            Software rankings based on real market share — not who pays the most.
          </p>
          <p className="text-sm text-wiki-text-muted mb-8 max-w-xl mx-auto">
            Compare {productCount.toLocaleString()} products across {categoryCount} categories.
            Independent, AI-curated, and free.
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
              <BarChart3 className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Ranked by Market Share</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              Products are ranked by actual global adoption. The most widely used tools
              appear first — not whoever buys the top spot.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Independent Data</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              No vendor-submitted listings. Product data is extracted from public
              sources — pricing pages, docs, and feature lists — then verified by AI.
            </p>
          </div>
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-wiki-accent" />
            </div>
            <h3 className="font-semibold text-wiki-text mb-1.5 text-sm">Filter by Your Industry</h3>
            <p className="text-xs text-wiki-text-muted leading-relaxed">
              A CRM for healthcare is different from a CRM for construction. Browse software
              ranked specifically for your industry and business type.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section id="industries" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-wiki-border">
        <h2 className="text-xl font-semibold text-wiki-text mb-2">
          What kind of business do you run?
        </h2>
        <p className="text-sm text-wiki-text-muted mb-6">
          Get software recommendations tailored to your industry.
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

      {/* Software Categories with Top Products */}
      {topCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-wiki-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-wiki-text">Browse by software category</h2>
              <p className="text-sm text-wiki-text-muted mt-1">Top products in each category, ranked by adoption.</p>
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
