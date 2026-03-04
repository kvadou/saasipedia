'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ChevronRight,
  Layers,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import type { Product } from '@/lib/data';

type SortOption = 'relevance' | 'name' | 'features' | 'quality';

interface CategoryFacet {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  query: string;
  initialResults: Product[];
  categories: CategoryFacet[];
}

const RESULTS_PER_PAGE = 24;

export default function SearchResultsClient({ query, initialResults, categories }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    let results = [...initialResults];

    // Filter by category
    if (selectedCategories.size > 0) {
      results = results.filter((r) => selectedCategories.has(r.normalized_category || r.category || 'Uncategorized'));
    }

    // Sort
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'features':
        results.sort((a, b) => (b.feature_count ?? 0) - (a.feature_count ?? 0));
        break;
      case 'quality':
        results.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0));
        break;
      // 'relevance' keeps the original order from the server
    }

    return results;
  }, [initialResults, selectedCategories, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / RESULTS_PER_PAGE);
  const paginatedResults = filteredAndSorted.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  function toggleCategory(name: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    setCurrentPage(1);
  }

  function clearFilters() {
    setSelectedCategories(new Set());
    setSortBy('relevance');
    setCurrentPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSortBy(value);
    setCurrentPage(1);
  }

  const hasActiveFilters = selectedCategories.size > 0 || sortBy !== 'relevance';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Search</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-6">Search</h1>

      <div className="mb-6">
        <SearchBar size="lg" defaultValue={query} placeholder="Search products, categories, features..." />
      </div>

      {query && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-wiki-text">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-wiki-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mb-5">
                <label className="text-xs font-medium text-wiki-text-muted uppercase tracking-wider mb-2 block">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="w-full text-sm border border-wiki-border rounded-md px-2.5 py-1.5 bg-white
                    text-wiki-text focus:outline-none focus:ring-2 focus:ring-wiki-accent/30 focus:border-wiki-accent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name A-Z</option>
                  <option value="features">Most Features</option>
                  <option value="quality">Highest Quality</option>
                </select>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-wiki-text-muted uppercase tracking-wider mb-2 block">
                    Category ({categories.length})
                  </label>
                  <div className="space-y-0.5 max-h-96 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => toggleCategory(cat.name)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${
                          selectedCategories.has(cat.name)
                            ? 'bg-wiki-accent/10 text-wiki-accent font-medium'
                            : 'text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-xs shrink-0 ml-1">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-wiki-border
                text-sm text-wiki-text hover:bg-wiki-bg-alt transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters & Sort
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-wiki-accent text-white text-xs flex items-center justify-center">
                  {selectedCategories.size + (sortBy !== 'relevance' ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="mt-3 p-4 bg-wiki-bg-alt rounded-lg border border-wiki-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-wiki-text">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-wiki-accent hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Sort — mobile */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-wiki-text-muted uppercase tracking-wider mb-1.5 block">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="w-full text-sm border border-wiki-border rounded-md px-2.5 py-2 bg-white
                      text-wiki-text focus:outline-none focus:ring-2 focus:ring-wiki-accent/30"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name A-Z</option>
                    <option value="features">Most Features</option>
                    <option value="quality">Highest Quality</option>
                  </select>
                </div>

                {/* Category pills — mobile */}
                {categories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-wiki-text-muted uppercase tracking-wider mb-1.5 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.slice(0, 16).map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => toggleCategory(cat.name)}
                          className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                            selectedCategories.has(cat.name)
                              ? 'bg-wiki-accent text-white'
                              : 'bg-white border border-wiki-border text-wiki-text-muted hover:border-wiki-accent'
                          }`}
                        >
                          {cat.name} ({cat.count})
                        </button>
                      ))}
                      {categories.length > 16 && (
                        <span className="px-2.5 py-1 text-xs text-wiki-text-muted">
                          +{categories.length - 16} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Active filters + result count */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-wiki-text-muted">
                {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'result' : 'results'}
                {selectedCategories.size > 0
                  ? ` in ${selectedCategories.size} ${selectedCategories.size === 1 ? 'category' : 'categories'}`
                  : ''}
                {' '}for &ldquo;{query}&rdquo;
                {totalPages > 1 && (
                  <span className="ml-1">
                    (page {currentPage} of {totalPages})
                  </span>
                )}
              </p>

              {/* Active filter pills */}
              {selectedCategories.size > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
                  {Array.from(selectedCategories).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                        bg-wiki-accent/10 text-wiki-accent hover:bg-wiki-accent/20 transition-colors"
                    >
                      {cat}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredAndSorted.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-wiki-text-muted mb-2">
                  {initialResults.length > 0
                    ? 'No products match your filters.'
                    : `No products found for "${query}"`}
                </p>
                {initialResults.length > 0 ? (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-wiki-accent hover:underline"
                  >
                    Clear filters
                  </button>
                ) : (
                  <p className="text-sm text-wiki-text-muted">
                    Try a different search term or{' '}
                    <Link href="/categories" className="text-wiki-accent hover:underline">
                      browse by category
                    </Link>
                    .
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {paginatedResults.map((product) => {
                    const qualityPercent = Math.round((product.quality_score ?? 0) * 100);
                    return (
                      <Link
                        key={product.id}
                        href={`/wiki/${product.slug}`}
                        className="flex items-start gap-4 p-4 rounded-lg border border-wiki-border
                          hover:border-wiki-accent/30 hover:bg-wiki-bg-alt transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 className="font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
                              {product.name}
                            </h2>
                            {product.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wiki-indigo/10 text-wiki-indigo">
                                {product.category}
                              </span>
                            )}
                          </div>
                          {product.tagline && (
                            <p className="text-sm text-wiki-text-muted line-clamp-2 mb-1.5">
                              {product.tagline}
                            </p>
                          )}
                          {product.url && (
                            <span className="inline-flex items-center gap-1 text-xs text-wiki-text-muted/70">
                              <ExternalLink className="w-3 h-3" />
                              {product.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 mt-1">
                          {qualityPercent > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5">
                              <div className="w-12 h-1.5 rounded-full bg-wiki-border overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${qualityPercent}%`,
                                    backgroundColor:
                                      qualityPercent >= 70
                                        ? '#22c55e'
                                        : qualityPercent >= 40
                                        ? '#eab308'
                                        : '#ef4444',
                                  }}
                                />
                              </div>
                              <span className="text-xs text-wiki-text-muted">
                                {qualityPercent}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-wiki-text-muted">
                            <Layers className="w-3.5 h-3.5" />
                            {product.feature_count}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-wiki-border
                        hover:bg-wiki-bg-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first, last, current, and neighbors
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .reduce<(number | 'ellipsis')[]>((acc, page, i, arr) => {
                          if (i > 0 && page - (arr[i - 1] as number) > 1) {
                            acc.push('ellipsis');
                          }
                          acc.push(page);
                          return acc;
                        }, [])
                        .map((item, i) =>
                          item === 'ellipsis' ? (
                            <span key={`ellipsis-${i}`} className="px-2 text-wiki-text-muted">
                              ...
                            </span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setCurrentPage(item)}
                              className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                                currentPage === item
                                  ? 'bg-wiki-accent text-white font-medium'
                                  : 'hover:bg-wiki-bg-alt text-wiki-text-muted'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-wiki-border
                        hover:bg-wiki-bg-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-wiki-text-muted mb-2">
            Type a product name, category, or feature to search.
          </p>
          <p className="text-sm text-wiki-text-muted">
            Or{' '}
            <Link href="/categories" className="text-wiki-accent hover:underline">
              browse by category
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
