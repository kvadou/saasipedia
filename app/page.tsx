import Link from 'next/link';
import { ArrowRight, Layers, Tag, Search as SearchIcon } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import {
  getCategories,
  getFeaturedProducts,
  getRecentProducts,
  getTotalProductCount,
  getTotalFeatureCount,
  getTotalCategoryCount,
} from '@/lib/data';

export const revalidate = 3600; // revalidate every hour

export default async function HomePage() {
  const [categories, featured, recent, productCount, featureCount, categoryCount] =
    await Promise.all([
      getCategories(),
      getFeaturedProducts(8),
      getRecentProducts(8),
      getTotalProductCount(),
      getTotalFeatureCount(),
      getTotalCategoryCount(),
    ]);

  const topCategories = categories.slice(0, 12);
  // Use recent if available, otherwise fall back to featured
  const displayProducts = recent.length > 0 ? recent : featured;

  return (
    <div>
      {/* Hero */}
      <section className="bg-wiki-bg-alt border-b border-wiki-border">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-wiki-text mb-3">
            SaaSipedia
          </h1>
          <p className="text-lg text-wiki-text-muted mb-8">
            The encyclopedia of business software
          </p>

          <div className="flex justify-center mb-8">
            <SearchBar size="lg" placeholder="Search products, categories, features..." />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-wiki-text-muted">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>
                <strong className="text-wiki-text">{productCount.toLocaleString()}</strong> products
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <SearchIcon className="w-4 h-4" />
              <span>
                <strong className="text-wiki-text">{featureCount.toLocaleString()}</strong> features
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>
                <strong className="text-wiki-text">{categoryCount}</strong> categories
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-wiki-text">Browse by Category</h2>
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

      {/* Recently Updated / Featured */}
      {displayProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-xl font-semibold text-wiki-text mb-6">
            {recent.length > 0 ? 'Recently Updated' : 'Featured Products'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
