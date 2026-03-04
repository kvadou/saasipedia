import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import CategoryProductList from '@/components/CategoryProductList';
import CategoryCTA from '@/components/CategoryCTA';
import {
  getCategories,
  getCategoryProductsRanked,
  deslugifyCategory,
  type RankedProduct,
  type CategoryInfo,
} from '@/lib/data';
import { getIndustryBySlug, type Industry, type BusinessType } from '@/lib/industries';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
  searchParams: { industry?: string; type?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug === params.slug);
  const name = match?.category || deslugifyCategory(params.slug);

  return {
    title: `${name} Software — Browse Products`,
    description: `Explore and compare ${name} software products. View features, pricing, and integrations for ${match?.count || 'all'} tools in this category.`,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: `${name} Software — Browse Products | SaaSipedia`,
      description: `Explore and compare ${name} software products. View features, pricing, and integrations for ${match?.count || 'all'} tools in this category.`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug === params.slug);

  const categoryName = match?.category || deslugifyCategory(params.slug);

  const industry = searchParams.industry
    ? getIndustryBySlug(searchParams.industry)
    : undefined;
  const businessType = industry && searchParams.type
    ? industry.businessTypes.find((bt) => bt.slug === searchParams.type)
    : undefined;

  const products = await getCategoryProductsRanked(categoryName, industry?.slug);

  if (products.length === 0 && !match) {
    for (const cat of categories) {
      if (cat.slug === params.slug) {
        const catProducts = await getCategoryProductsRanked(cat.category, industry?.slug);
        if (catProducts.length > 0) {
          return renderCategoryPage(cat.category, catProducts, categories, params.slug, industry, businessType);
        }
      }
    }
    notFound();
  }

  return renderCategoryPage(categoryName, products, categories, params.slug, industry, businessType);
}

function renderCategoryPage(
  categoryName: string,
  products: RankedProduct[],
  allCategories: CategoryInfo[],
  slug: string,
  industry?: Industry,
  businessType?: BusinessType,
) {
  const relatedCategories = allCategories
    .filter((c) => c.category !== categoryName)
    .slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://saasipedia.com/categories' },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `https://saasipedia.com/category/${slug}` },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        // JSON-LD structured data — not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-wiki-accent transition-colors">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{categoryName}</span>
      </nav>

      {/* Industry context banner */}
      {industry && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Link
            href={`/industry/${industry.slug}${businessType ? `?type=${businessType.slug}` : ''}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {industry.name}
          </Link>
          <span className="text-sm text-blue-600">
            Browsing {categoryName} software for{' '}
            <strong>{businessType ? businessType.name : industry.name}</strong>
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          {categoryName} Software{industry ? ` for ${industry.name}` : ''}
        </h1>
        <p className="text-wiki-text-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'} in this category.
        </p>
      </div>

      {/* Product list with toolbar */}
      <CategoryProductList
        products={JSON.parse(JSON.stringify(products))}
        hasIndustry={!!industry}
        industryName={industry?.name}
      />

      {/* CTA funnel — industry-filtered pages only */}
      {industry && (
        <CategoryCTA
          categoryName={categoryName}
          categorySlug={slug}
          industryName={industry.name}
          industrySlug={industry.slug}
        />
      )}

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <div className="border-t border-wiki-border pt-8">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">Other Categories</h2>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt
                  text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
              >
                {cat.category} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
