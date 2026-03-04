import Link from 'next/link';
import { Layers, Star } from 'lucide-react';
import type { Product } from '@/lib/data';
import type { RelevanceData } from '@/lib/data';

const POSITION_STYLES: Record<string, { label: string; className: string }> = {
  leader: { label: 'Leader', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  challenger: { label: 'Challenger', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  niche: { label: 'Niche', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

interface ProductCardProps {
  product: Product;
  rank?: number;
  relevance?: RelevanceData;
}

export default function ProductCard({ product, rank, relevance }: ProductCardProps) {
  const qualityPercent = Math.round((product.quality_score ?? 0) * 100);
  const position = relevance?.market_position ? POSITION_STYLES[relevance.market_position] : undefined;

  return (
    <Link href={`/wiki/${product.slug}`} className="wiki-card group block">
      <div className="flex items-start justify-between mb-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {rank != null && (
            <span className="text-sm font-bold text-wiki-text-muted shrink-0">
              #{rank}
            </span>
          )}
          <h3 className="text-base font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors min-w-0">
            {product.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {position && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${position.className}`}>
              {position.label}
            </span>
          )}
          {relevance?.industry_specific && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200 flex items-center gap-0.5">
              <Star className="w-3 h-3" />
              Specialist
            </span>
          )}
        </div>
      </div>

      {product.tagline && (
        <p className="text-sm text-wiki-text-muted line-clamp-2 mb-3">
          {product.tagline}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-wiki-text-muted">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {product.feature_count} features
        </span>

        {qualityPercent > 0 && (
          <div className="flex items-center gap-2">
            <div className="quality-bar w-16">
              <div
                className="quality-bar-fill"
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
            <span>{qualityPercent}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}
