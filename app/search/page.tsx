import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Layers } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { searchProducts, slugifyCategory } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for SaaS products by name, category, or feature.',
};

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || '';
  const results = query ? await searchProducts(query, 30) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Search</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-6">Search</h1>

      <div className="mb-8">
        <SearchBar size="lg" defaultValue={query} placeholder="Search products, categories, features..." />
      </div>

      {query && (
        <p className="text-sm text-wiki-text-muted mb-6">
          {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-wiki-text-muted mb-2">
            No products found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-wiki-text-muted">
            Try a different search term or{' '}
            <Link href="/categories" className="wiki-link">
              browse by category
            </Link>
            .
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/wiki/${product.slug}`}
              className="flex items-start gap-4 p-4 rounded-lg border border-wiki-border
                hover:border-wiki-accent/30 hover:bg-wiki-bg-alt transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
                    {product.name}
                  </h2>
                  {product.category && (
                    <span className="wiki-badge text-xs">{product.category}</span>
                  )}
                </div>
                {product.tagline && (
                  <p className="text-sm text-wiki-text-muted line-clamp-1">
                    {product.tagline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-wiki-text-muted shrink-0 mt-1">
                <Layers className="w-3.5 h-3.5" />
                {product.feature_count}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
