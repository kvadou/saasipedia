import type { Metadata } from 'next';
import { searchProducts, slugifyCategory } from '@/lib/data';
import SearchResultsClient from './SearchResultsClient';

interface PageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = searchParams.q?.trim() || '';
  if (query) {
    return {
      title: `Search results for "${query}" — SaaSipedia`,
      description: `Find SaaS products matching "${query}". Compare features, pricing, and alternatives across business software.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: 'Search SaaS Products — SaaSipedia',
    description: 'Search across thousands of SaaS products by name, category, or feature. Compare features, pricing, and alternatives.',
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || '';
  const results = query ? await searchProducts(query, 200) : [];

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
