'use client';

import { useCallback, useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

export type ViewMode = 'list' | 'grid';
export type SortOption = 'relevance' | 'features' | 'quality' | 'name';
export type PositionFilter = 'all' | 'leader' | 'challenger' | 'niche' | 'specialist';

interface CategoryToolbarProps {
  hasIndustry: boolean;
  hasRankedProducts: boolean;
  productCount: number;
  industryName?: string;
  onViewChange: (view: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: PositionFilter) => void;
  view: ViewMode;
  sort: SortOption;
  filter: PositionFilter;
}

const SORT_OPTIONS: { value: SortOption; label: string; requiresIndustry?: boolean }[] = [
  { value: 'relevance', label: 'Relevance', requiresIndustry: true },
  { value: 'features', label: 'Most Features' },
  { value: 'quality', label: 'Data Quality' },
  { value: 'name', label: 'Name A–Z' },
];

const FILTER_OPTIONS: { value: PositionFilter; label: string; requiresIndustry?: boolean }[] = [
  { value: 'all', label: 'All' },
  { value: 'leader', label: 'Leaders', requiresIndustry: true },
  { value: 'challenger', label: 'Challengers', requiresIndustry: true },
  { value: 'niche', label: 'Niche', requiresIndustry: true },
  { value: 'specialist', label: 'Specialists', requiresIndustry: true },
];

export default function CategoryToolbar({
  hasIndustry,
  hasRankedProducts,
  productCount,
  industryName,
  onViewChange,
  onSortChange,
  onFilterChange,
  view,
  sort,
  filter,
}: CategoryToolbarProps) {
  const sortOptions = SORT_OPTIONS.filter(
    (o) => !o.requiresIndustry || (hasIndustry && hasRankedProducts)
  );
  const filterOptions = FILTER_OPTIONS.filter(
    (o) => !o.requiresIndustry || (hasIndustry && hasRankedProducts)
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* Left: sort + filter */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-wiki-text-muted" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-xs font-medium text-wiki-text bg-wiki-bg-alt border border-wiki-border
                       rounded-md px-2 py-1.5 cursor-pointer hover:border-wiki-border-dark
                       focus:outline-none focus:ring-1 focus:ring-wiki-accent"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter pills */}
        {filterOptions.length > 1 && (
          <div className="flex items-center gap-1">
            {filterOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => onFilterChange(o.value)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all
                  ${filter === o.value
                    ? 'bg-wiki-accent text-white border-wiki-accent'
                    : 'bg-wiki-bg-alt text-wiki-text-muted border-wiki-border hover:border-wiki-border-dark'
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: view toggle */}
      <div className="flex items-center gap-1 border border-wiki-border rounded-md p-0.5">
        <button
          onClick={() => onViewChange('list')}
          className={`p-1.5 rounded transition-all ${
            view === 'list'
              ? 'bg-wiki-accent text-white'
              : 'text-wiki-text-muted hover:text-wiki-text'
          }`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewChange('grid')}
          className={`p-1.5 rounded transition-all ${
            view === 'grid'
              ? 'bg-wiki-accent text-white'
              : 'text-wiki-text-muted hover:text-wiki-text'
          }`}
          title="Grid view"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
