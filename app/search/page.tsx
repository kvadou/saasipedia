import type { Metadata } from 'next';
import { searchProducts, slugifyCategory } from '@/lib/data';
import SearchResultsClient from './SearchResultsClient';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for SaaS products by name, category, or feature.',
};

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || '';
  const results = query ? await searchProducts(query, 100) : [];

  // Build category facets from results
  const categoryMap: Record<string, number> = {};
  for (const r of results) {
    const cat = r.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, slug: slugifyCategory(name), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <SearchResultsClient
      query={query}
      initialResults={results}
      categories={categories}
    />
  );
}
