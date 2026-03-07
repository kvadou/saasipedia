import Link from 'next/link';
import { Hammer, Layers, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/data';
import { slugifyCategory } from '@/lib/data';

interface IndustryCategoryCardProps {
  categoryName: string;
  relevance: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  products: Product[];
  industrySlug: string;
  businessTypeSlug?: string;
  productCount?: number;
}

const relevanceBadge: Record<
  string,
  { label: string; className: string }
> = {
  essential: {
    label: 'Essential',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  recommended: {
    label: 'Recommended',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'nice-to-have': {
    label: 'Nice to Have',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export default function IndustryCategoryCard({
  categoryName,
  relevance,
  reason,
  products,
  industrySlug,
  businessTypeSlug,
  productCount,
}: IndustryCategoryCardProps) {
  const categorySlug = slugifyCategory(categoryName);
  const badge = relevanceBadge[relevance];
  const reapUrl =
    process.env.NEXT_PUBLIC_REAP_URL || 'https://reaplabs.ai';
  const buildUrl = `${reapUrl}/reap/start?category=${categorySlug}&industry=${industrySlug}${businessTypeSlug ? `&business=${businessTypeSlug}` : ''}`;

  return (
    <div className={`wiki-card flex flex-col ${relevance === 'essential' ? 'ring-1 ring-green-200 border-green-200' : ''}`}>
      {/* Top row: category + relevance badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/category/${categorySlug}`}
          className="text-base font-semibold text-wiki-text hover:text-wiki-accent transition-colors"
        >
          {categoryName}
        </Link>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Product count + reason */}
      {productCount != null && productCount > 0 && (
        <p className="text-xs font-medium text-wiki-accent mb-1">
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </p>
      )}
      <p className="text-sm text-wiki-text-muted mb-3 line-clamp-2">
        {reason}
      </p>

      {/* Products */}
      {products.length > 0 && (
        <div className="space-y-2 mb-3 flex-1">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/wiki/${product.slug}`}
              className="flex items-center justify-between text-sm group"
            >
              <span className="text-wiki-text group-hover:text-wiki-accent transition-colors truncate">
                {product.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-wiki-text-muted shrink-0 ml-2">
                <Layers className="w-3 h-3" />
                {product.feature_count}
              </span>
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 && (
        <div className="flex-1 mb-3">
          <p className="text-xs text-wiki-text-muted italic">
            No products cataloged yet
          </p>
        </div>
      )}

      {/* Footer links */}
      <div className="flex items-center justify-between pt-3 border-t border-wiki-border text-xs">
        <Link
          href={`/category/${categorySlug}?industry=${industrySlug}${businessTypeSlug ? `&type=${businessTypeSlug}` : ''}`}
          className="inline-flex items-center gap-1 text-wiki-accent hover:underline"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
        <a
          href={buildUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-wiki-text-muted hover:text-wiki-accent transition-colors"
        >
          <Hammer className="w-3 h-3" />
          Or build your own
        </a>
      </div>
    </div>
  );
}
