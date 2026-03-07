import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import CategoryProductList from '@/components/CategoryProductList';
import CategoryCTA from '@/components/CategoryCTA';
import FAQAccordion from '@/components/FAQAccordion';
import {
  getCategories,
  getCategoryProductsRanked,
  slugifyCategory,
  deslugifyCategory,
  generateCategoryFAQs,
  generateCategoryKnowledgePanel,
  type RankedProduct,
  type CategoryInfo,
} from '@/lib/data';
import { getIndustryBySlug, getIndustryCategories, type Industry, type BusinessType } from '@/lib/industries';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
  searchParams: { industry?: string; type?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug === params.slug);
  const name = match?.category || deslugifyCategory(params.slug);
  const nameSuffix = name.toLowerCase().endsWith('software') ? '' : ' Software';

  return {
    title: `${name}${nameSuffix} — Browse Products`,
    description: `Explore and compare ${name.toLowerCase()} products. View features, pricing, and integrations for ${match?.count || 'all'} tools in this category.`,
    alternates: {
      canonical: `/category/${params.slug}`,
    },
    openGraph: {
      title: `${name}${nameSuffix} — Browse Products | SaaSipedia`,
      description: `Explore and compare ${name.toLowerCase()} products. View features, pricing, and integrations for ${match?.count || 'all'} tools in this category.`,
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
  // Industry-aware related categories
  const industryCategories = industry
    ? getIndustryCategories(industry).filter((m) => m.category !== categoryName)
    : [];

  const relatedCategories = allCategories
    .filter((c) => c.category !== categoryName)
    .slice(0, 6);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://saasipedia.com/categories' },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `https://saasipedia.com/category/${slug}` },
    ],
  };

  // Knowledge panel
  const knowledgePanel = generateCategoryKnowledgePanel(categoryName, products.length, products);

  const knowledgePanelJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: knowledgePanel.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: knowledgePanel.description,
        },
      },
    ],
  };

  // Generate FAQs for industry-filtered pages
  const faqs = industry
    ? generateCategoryFAQs(categoryName, industry.name, industry.slug, products)
    : [];

  const faqJsonLd = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  // ItemList + SoftwareApplication schema for top 10 products
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} Software${industry ? ` for ${industry.name}` : ''}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://saasipedia.com/wiki/${p.slug}`,
      item: {
        '@type': 'SoftwareApplication',
        name: p.name,
        applicationCategory: categoryName,
        url: `https://saasipedia.com/wiki/${p.slug}`,
        ...(p.tagline ? { description: p.tagline } : {}),
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* JSON-LD structured data — all values from our own database, not user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledgePanelJsonLd) }}
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
          {categoryName}{categoryName.toLowerCase().endsWith('software') ? '' : ' Software'}{industry ? ` for ${industry.name}` : ''}
        </h1>
        <p className="text-wiki-text-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'} in this category.
        </p>
      </div>

      {/* What is X? knowledge panel */}
      <div className="mb-8 p-5 rounded-lg bg-wiki-bg-alt border border-wiki-border">
        <h2 className="text-base font-semibold text-wiki-text mb-2">{knowledgePanel.title}</h2>
        <p className="text-sm text-wiki-text-muted leading-relaxed">{knowledgePanel.description}</p>
      </div>

      {/* BLUF intro */}
      {products.length >= 3 && products[0].relevance && (() => {
        const top3 = products.slice(0, 3);
        const leader = top3[0];
        const leaderPosition = leader.relevance?.market_position;
        const year = new Date().getFullYear();

        if (industry) {
          const industrySpecificCount = products.filter((p) => p.relevance?.industry_specific).length;
          return (
            <div className="mb-8 p-4 rounded-lg bg-wiki-bg-alt border border-wiki-border">
              <p className="text-wiki-text leading-relaxed">
                The best {categoryName.toLowerCase().endsWith('software') ? categoryName.toLowerCase() : `${categoryName.toLowerCase()} software`} for {industry.name.toLowerCase()} in {year}:{' '}
                <strong>{top3[0].name}</strong>
                {leaderPosition === 'leader' ? ' leads the category' : ' ranks #1'}
                , followed by <strong>{top3[1].name}</strong> and <strong>{top3[2].name}</strong>.
                {industrySpecificCount > 0 && (
                  <> {industrySpecificCount} of the top {Math.min(products.length, 10)} {industrySpecificCount === 1 ? 'is' : 'are'} built specifically for {industry.name.toLowerCase()} businesses.</>
                )}
              </p>
            </div>
          );
        }

        // General (no industry) BLUF
        return (
          <div className="mb-8 p-4 rounded-lg bg-wiki-bg-alt border border-wiki-border">
            <p className="text-wiki-text leading-relaxed">
              The most widely used {categoryName.toLowerCase().endsWith('software') ? categoryName.toLowerCase() : `${categoryName.toLowerCase()} software`} in {year}:{' '}
              <strong>{top3[0].name}</strong>
              {leaderPosition === 'leader' ? ' leads by market share' : ' ranks #1'}
              , followed by <strong>{top3[1].name}</strong> and <strong>{top3[2].name}</strong>.
              {' '}Rankings based on global adoption, not paid placement.
            </p>
          </div>
        );
      })()}

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

      {/* FAQ section — industry-filtered pages only */}
      {faqs.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mt-8">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={faqs} />
        </div>
      )}

      {/* Industry-specific related categories */}
      {industry && industryCategories.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mt-8">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">
            More {industry.name} Software
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {industryCategories.map((mapping) => {
              const catSlug = slugifyCategory(mapping.category);
              return (
                <Link
                  key={catSlug}
                  href={`/category/${catSlug}?industry=${industry.slug}`}
                  className="px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt
                    text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
                >
                  {mapping.category}
                  {mapping.relevance === 'essential' && (
                    <span className="ml-1 text-xs text-wiki-accent">•</span>
                  )}
                </Link>
              );
            })}
          </div>
          <Link
            href={`/industry/${industry.slug}`}
            className="text-sm wiki-link"
          >
            View all {industry.name} software →
          </Link>
        </div>
      )}

      {/* Other categories */}
      {relatedCategories.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mt-8">
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
