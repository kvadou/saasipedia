import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StackBuilder from '@/components/StackBuilder';
import { INDUSTRIES } from '@/lib/industries';
import { getProductsByCategories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Software Stack Builder — Find Your Complete Tech Stack',
  description:
    'Build your ideal software stack based on your industry. Get recommendations for every category — CRM, accounting, project management, and more.',
  alternates: { canonical: '/stack' },
};

export const revalidate = 3600;

export default async function StackPage() {
  // Pre-fetch top products for all industry categories
  const allCategoryNames = new Set<string>();
  for (const industry of INDUSTRIES) {
    for (const mapping of industry.categoryMappings) {
      allCategoryNames.add(mapping.category);
    }
  }

  const productsByCategory = await getProductsByCategories(
    Array.from(allCategoryNames),
    3
  );

  // Serialize for client
  const serializedProducts = JSON.parse(JSON.stringify(productsByCategory));
  const serializedIndustries = INDUSTRIES.map((ind) => ({
    slug: ind.slug,
    name: ind.name,
    icon: ind.icon,
    description: ind.description,
    businessTypes: ind.businessTypes.map((bt) => ({
      slug: bt.slug,
      name: bt.name,
    })),
    categoryMappings: ind.categoryMappings.map((m) => ({
      category: m.category,
      relevance: m.relevance,
      reason: m.reason,
    })),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Stack Builder</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">Software Stack Builder</h1>
        <p className="text-wiki-text-muted max-w-2xl">
          Pick your industry to see a complete recommended software stack — every tool category you need, with the top products in each.
        </p>
      </div>

      <StackBuilder
        industries={serializedIndustries}
        productsByCategory={serializedProducts}
      />
    </div>
  );
}
