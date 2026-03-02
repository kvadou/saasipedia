'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { BusinessType } from '@/lib/industries';

interface BusinessTypeFilterProps {
  industrySlug: string;
  businessTypes: BusinessType[];
}

export default function BusinessTypeFilter({
  industrySlug,
  businessTypes,
}: BusinessTypeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get('type') || 'all';

  function handleSelect(slug: string) {
    const url =
      slug === 'all'
        ? `/industry/${industrySlug}`
        : `/industry/${industrySlug}?type=${slug}`;
    router.push(url, { scroll: false });
  }

  const pillBase =
    'px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer whitespace-nowrap';
  const pillSelected = 'bg-wiki-accent text-white border-wiki-accent';
  const pillUnselected =
    'bg-white text-wiki-text-muted border-wiki-border hover:border-wiki-accent hover:text-wiki-accent';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect('all')}
        className={`${pillBase} ${selected === 'all' ? pillSelected : pillUnselected}`}
      >
        All
      </button>
      {businessTypes.map((bt) => (
        <button
          key={bt.slug}
          onClick={() => handleSelect(bt.slug)}
          className={`${pillBase} ${selected === bt.slug ? pillSelected : pillUnselected}`}
        >
          {bt.name}
        </button>
      ))}
    </div>
  );
}
