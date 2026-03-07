'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleFeatureCategoryProps {
  featureCount: number;
  children: React.ReactNode;
  initialLimit?: number;
}

export default function CollapsibleFeatureCategory({
  featureCount,
  children,
  initialLimit = 5,
}: CollapsibleFeatureCategoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (featureCount <= initialLimit) {
    return <>{children}</>;
  }

  return (
    <div>
      <div className={expanded ? '' : 'max-h-[280px] overflow-hidden relative'}>
        {children}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-2 text-sm text-wiki-accent hover:text-wiki-accent-hover transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Show fewer
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show all {featureCount} features
          </>
        )}
      </button>
    </div>
  );
}
