import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getProductsWithPricing, type PricingOverview } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'SaaS Pricing Directory — Compare Software Costs',
  description:
    'Browse SaaS pricing across hundreds of products. Find free tools, budget-friendly options, and enterprise solutions.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'SaaS Pricing Directory — Compare Software Costs | SaaSipedia',
    description:
      'Browse SaaS pricing across hundreds of products. Find free tools, budget-friendly options, and enterprise solutions.',
  },
};

interface PriceGroup {
  label: string;
  id: string;
  items: PricingOverview[];
}

function groupByPrice(items: PricingOverview[]): PriceGroup[] {
  const free: PricingOverview[] = [];
  const under25: PricingOverview[] = [];
  const under50: PricingOverview[] = [];
  const under100: PricingOverview[] = [];
  const over100: PricingOverview[] = [];
  const contactSales: PricingOverview[] = [];

  for (const item of items) {
    if (item.hasFreeTier) free.push(item);
    if (item.minPrice !== null) {
      if (item.minPrice < 25) under25.push(item);
      else if (item.minPrice < 50) under50.push(item);
      else if (item.minPrice < 100) under100.push(item);
      else over100.push(item);
    } else if (!item.hasFreeTier) {
      contactSales.push(item);
    }
  }

  return [
    { label: 'Free Tier Available', id: 'free', items: free },
    { label: 'Under $25/mo', id: 'under-25', items: under25 },
    { label: '$25 – $49/mo', id: '25-49', items: under50 },
    { label: '$50 – $99/mo', id: '50-99', items: under100 },
    { label: '$100+/mo', id: '100-plus', items: over100 },
    { label: 'Contact Sales', id: 'contact-sales', items: contactSales },
  ].filter((g) => g.items.length > 0);
}

function formatPrice(item: PricingOverview): string {
  if (item.hasFreeTier && item.minPrice === null) return 'Free';
  if (item.hasFreeTier && item.minPrice !== null) return `Free / $${item.minPrice}/mo`;
  if (item.minPrice !== null) return `$${item.minPrice}/mo`;
  return 'Contact Sales';
}

export default async function PricingDirectoryPage() {
  const allProducts = await getProductsWithPricing();
  const groups = groupByPrice(allProducts);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Pricing</span>
      </nav>

      <h1 className="text-3xl font-bold text-wiki-text mb-2">SaaS Pricing Directory</h1>
      <p className="text-wiki-text-muted mb-4">
        Compare pricing across {allProducts.length} SaaS products.
      </p>

      {/* Jump links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="text-xs px-3 py-1.5 rounded-full border border-wiki-border bg-wiki-bg-alt text-wiki-text-muted hover:text-wiki-accent hover:border-wiki-accent transition-all"
          >
            {group.label} ({group.items.length})
          </a>
        ))}
      </div>

      {/* Price groups */}
      {groups.map((group) => (
        <section key={group.id} id={group.id} className="mb-10 scroll-mt-20">
          <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
            {group.label}
            <span className="text-base font-normal text-wiki-text-muted ml-2">
              ({group.items.length})
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wiki-border text-left">
                  <th className="py-2 pr-4 font-semibold text-wiki-text">Product</th>
                  <th className="py-2 pr-4 font-semibold text-wiki-text hidden sm:table-cell">Category</th>
                  <th className="py-2 pr-4 font-semibold text-wiki-text">Starting Price</th>
                  <th className="py-2 pr-4 font-semibold text-wiki-text hidden md:table-cell">Features</th>
                  <th className="py-2 font-semibold text-wiki-text">Links</th>
                </tr>
              </thead>
              <tbody>
                {group.items.slice(0, 50).map((item) => (
                  <tr key={item.product.id} className="border-b border-wiki-border/50 hover:bg-wiki-bg-alt/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/wiki/${item.product.slug}`}
                        className="font-medium text-wiki-text hover:text-wiki-accent transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.tagline && (
                        <p className="text-xs text-wiki-text-muted line-clamp-1 mt-0.5">{item.product.tagline}</p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-wiki-text-muted hidden sm:table-cell">
                      {item.product.normalized_category || '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-wiki-text">
                      {formatPrice(item)}
                    </td>
                    <td className="py-2.5 pr-4 text-wiki-text-muted hidden md:table-cell">
                      {item.product.feature_count}
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-3">
                        <Link
                          href={`/alternatives/${item.product.slug}`}
                          className="text-xs text-wiki-accent hover:underline"
                        >
                          Alternatives
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {group.items.length > 50 && (
            <p className="text-xs text-wiki-text-muted mt-2">
              Showing top 50 of {group.items.length} products.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
