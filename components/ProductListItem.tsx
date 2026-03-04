import Link from 'next/link';
import { Layers, Star, ExternalLink } from 'lucide-react';
import type { Product } from '@/lib/data';
import type { RelevanceData } from '@/lib/data';

const POSITION_STYLES: Record<string, { label: string; className: string }> = {
  leader: { label: 'Leader', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  challenger: { label: 'Challenger', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  niche: { label: 'Niche', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

interface ProductListItemProps {
  product: Product;
  rank?: number;
  relevance?: RelevanceData;
}

export default function ProductListItem({ product, rank, relevance }: ProductListItemProps) {
  const qualityPercent = Math.round((product.quality_score ?? 0) * 100);
  const position = relevance?.market_position ? POSITION_STYLES[relevance.market_position] : undefined;

  return (
    <Link
      href={`/wiki/${product.slug}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-wiki-border bg-wiki-bg-alt
                 hover:border-wiki-border-dark hover:shadow-sm transition-all group"
    >
      {/* Rank */}
      {rank != null && (
        <span className="text-lg font-bold text-wiki-text-muted w-8 text-right shrink-0">
          {rank}
        </span>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors truncate">
            {product.name}
          </h3>
          {position && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${position.className}`}>
              {position.label}
            </span>
          )}
          {relevance?.industry_specific && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200 shrink-0 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" />
              Specialist
            </span>
          )}
        </div>
        {product.tagline && (
          <p className="text-xs text-wiki-text-muted truncate mt-0.5">
            {product.tagline}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-wiki-text-muted">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {product.feature_count}
        </span>
        {qualityPercent > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="quality-bar w-12">
              <div
                className="quality-bar-fill"
                style={{
                  width: `${qualityPercent}%`,
                  backgroundColor:
                    qualityPercent >= 70 ? '#22c55e' : qualityPercent >= 40 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
            <span className="w-7 text-right">{qualityPercent}%</span>
          </div>
        )}
        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    </Link>
  );
}
