import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import {
  getCategories,
  getCategoryProducts,
  deslugifyCategory,
  slugifyCategory,
} from '@/lib/data';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug === params.slug);
  const name = match?.category || deslugifyCategory(params.slug);

  return {
    title: `${name} Software — Browse Products`,
    description: `Explore and compare ${name} software products. View features, pricing, and integrations for ${match?.count || 'all'} tools in this category.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug === params.slug);

  // Try exact match first, then deslugify
  const categoryName = match?.category || deslugifyCategory(params.slug);
  const products = await getCategoryProducts(categoryName);

  // If no match found and deslugified also returned nothing, try case-insensitive
  if (products.length === 0 && !match) {
    // Try finding by iterating categories
    for (const cat of categories) {
      if (cat.slug === params.slug) {
        const catProducts = await getCategoryProducts(cat.category);
        if (catProducts.length > 0) {
          // Redirect would be ideal, but we'll just render
          return renderCategoryPage(cat.category, catProducts, categories);
        }
      }
    }
    notFound();
  }

  return renderCategoryPage(categoryName, products, categories);
}

function renderCategoryPage(
  categoryName: string,
  products: import('@/lib/data').Product[],
  allCategories: import('@/lib/data').CategoryInfo[]
) {
  const relatedCategories = allCategories
    .filter((c) => c.category !== categoryName)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-wiki-accent transition-colors">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{categoryName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          {categoryName} Software
        </h1>
        <p className="text-wiki-text-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'} in this category, sorted by data quality.
        </p>
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-wiki-text-muted">
          <p>No products found in this category.</p>
        </div>
      )}

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <div className="border-t border-wiki-border pt-8">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">
            Other Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt
                  text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent
                  transition-all"
              >
                {cat.category} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
