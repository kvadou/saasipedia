'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';
import CategoryToolbar, {
  type ViewMode,
  type SortOption,
  type PositionFilter,
} from './CategoryToolbar';
import type { RankedProduct } from '@/lib/data';

interface CategoryProductListProps {
  products: RankedProduct[];
  hasIndustry: boolean;
  industryName?: string;
}

export default function CategoryProductList({
  products,
  hasIndustry,
  industryName,
}: CategoryProductListProps) {
  const [view, setView] = useState<ViewMode>('list');
  const hasRankedProducts = products.some((p) => p.relevance);
  const [sort, setSort] = useState<SortOption>(
    hasIndustry && hasRankedProducts ? 'relevance' : 'quality'
  );
  const [filter, setFilter] = useState<PositionFilter>('all');

  const processed = useMemo(() => {
    let result = [...products];

    // Filter
    if (filter !== 'all') {
      if (filter === 'specialist') {
        result = result.filter((p) => p.relevance?.industry_specific);
      } else {
        result = result.filter((p) => p.relevance?.market_position === filter);
      }
    }

    // Sort
    switch (sort) {
      case 'relevance':
        // Already sorted by relevance from server (ranked first, then unranked)
        result.sort((a, b) => {
          if (a.relevance && b.relevance) return a.relevance.relevance_rank - b.relevance.relevance_rank;
          if (a.relevance) return -1;
          if (b.relevance) return 1;
          return (b.quality_score ?? 0) - (a.quality_score ?? 0);
        });
        break;
      case 'features':
        result.sort((a, b) => (b.feature_count ?? 0) - (a.feature_count ?? 0));
        break;
      case 'quality':
        result.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, sort, filter]);

  const showRank = sort === 'relevance' && hasRankedProducts;

  return (
    <>
      <CategoryToolbar
        hasIndustry={hasIndustry}
        hasRankedProducts={hasRankedProducts}
        productCount={processed.length}
        industryName={industryName}
        onViewChange={setView}
        onSortChange={setSort}
        onFilterChange={setFilter}
        view={view}
        sort={sort}
        filter={filter}
      />

      {processed.length > 0 ? (
        view === 'list' ? (
          <div className="flex flex-col gap-2 mb-12">
            {processed.map((product, i) => (
              <ProductListItem
                key={product.id}
                product={product}
                rank={showRank ? i + 1 : undefined}
                relevance={product.relevance}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {processed.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                rank={showRank ? i + 1 : undefined}
                relevance={product.relevance}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16 text-wiki-text-muted mb-12">
          <p>No products match the current filters.</p>
        </div>
      )}
    </>
  );
}
