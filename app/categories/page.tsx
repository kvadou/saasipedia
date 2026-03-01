import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { getCategories, getCategoryProducts } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse by Category',
  description:
    'Browse all SaaS software categories. Find the right business tools by category with detailed feature comparisons.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Fetch top 3 product names for each category (limit to top 20 categories for perf)
  const topCategories = categories.slice(0, 30);
  const categoryDetails = await Promise.all(
    topCategories.map(async (cat) => {
      const products = await getCategoryProducts(cat.category);
      const topProducts = products.slice(0, 3).map((p) => p.name);
      return { ...cat, topProducts };
    })
  );

  // Remaining categories without product previews
  const remainingCategories = categories.slice(30);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Categories</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-2">Browse by Category</h1>
      <p className="text-wiki-text-muted mb-8">
        {categories.length} categories covering the SaaS landscape.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryDetails.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="wiki-card group"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
                {cat.category}
              </h2>
              <span className="text-xs text-wiki-text-muted bg-wiki-bg-alt px-2 py-0.5 rounded-full border border-wiki-border">
                {cat.count}
              </span>
            </div>

            {cat.topProducts.length > 0 && (
              <p className="text-sm text-wiki-text-muted line-clamp-1">
                {cat.topProducts.join(', ')}
                {cat.count > 3 && ` + ${cat.count - 3} more`}
              </p>
            )}
          </Link>
        ))}

        {remainingCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="wiki-card group"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
                {cat.category}
              </h2>
              <span className="text-xs text-wiki-text-muted bg-wiki-bg-alt px-2 py-0.5 rounded-full border border-wiki-border">
                {cat.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
