import Link from 'next/link';
import { ArrowRight, Layers, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import NewsletterSignup from '@/components/NewsletterSignup';
import {
  getCategories,
  getTotalProductCount,
  getTotalCategoryCount,
} from '@/lib/data';
import { INDUSTRIES } from '@/lib/industries';

export const revalidate = 3600; // revalidate every hour

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

  return (
    <div>
      {/* Hero */}
      <section className="bg-wiki-bg-alt border-b border-wiki-border">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-wiki-text mb-3">
            SaaSipedia
          </h1>
          <p className="text-lg text-wiki-text-muted mb-8">
            Find the right software for your business
          </p>

          <div className="flex justify-center">
            <SearchBar size="lg" placeholder="Search products, categories, features..." />
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section id="industries" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-wiki-text mb-6">
          What kind of business do you run?
        </h2>

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
                {industry.businessTypes.length} business {industry.businessTypes.length === 1 ? 'type' : 'types'}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Software Categories */}
      {topCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-wiki-text">Or browse by software category</h2>
            <Link href="/categories" className="wiki-link text-sm flex items-center gap-1">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="wiki-card text-center group"
              >
                <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                  {cat.category}
                </div>
                <div className="text-xs text-wiki-text-muted mt-1">
                  {cat.count} {cat.count === 1 ? 'product' : 'products'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-center gap-4 text-sm text-wiki-text-muted">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Covering <strong className="text-wiki-text">{productCount.toLocaleString()}</strong> products</span>
          </div>
          <span>across</span>
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            <span><strong className="text-wiki-text">{categoryCount}</strong> categories</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <NewsletterSignup source="homepage" />
      </section>
    </div>
  );
}
