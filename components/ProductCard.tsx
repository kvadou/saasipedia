import Link from 'next/link';
import { Layers } from 'lucide-react';
import type { Product } from '@/lib/data';
import { slugifyCategory } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const qualityPercent = Math.round((product.quality_score ?? 0) * 100);

  return (
    <Link href={`/wiki/${product.slug}`} className="wiki-card group block">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-wiki-text group-hover:text-wiki-accent transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <span className="wiki-badge ml-2 shrink-0">
            {product.category}
          </span>
        )}
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
