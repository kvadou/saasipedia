import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { INDUSTRIES, getIndustryBySlug, getIndustryCategories } from '@/lib/industries';
import { getProductsByCategories } from '@/lib/data';
import BusinessTypeFilter from '@/components/BusinessTypeFilter';
import IndustryCategoryCard from '@/components/IndustryCategoryCard';
import NewsletterSignup from '@/components/NewsletterSignup';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
  searchParams: { type?: string };
}

export async function generateStaticParams() {
  return INDUSTRIES.map((industry) => ({
    slug: industry.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) return {};

  const title = `Software for ${industry.name} Businesses`;
  const description = industry.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/industry/${industry.slug}`,
    },
    openGraph: {
      title: `${title} | SaaSipedia`,
      description,
    },
  };
}

export default async function IndustryPage({ params, searchParams }: PageProps) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  const selectedType = searchParams.type || undefined;
  const selectedBusinessType = selectedType
    ? industry.businessTypes.find((bt) => bt.slug === selectedType)
    : undefined;

  // Get filtered category mappings
  const categoryMappings = getIndustryCategories(industry, selectedType);

  // Fetch products for all categories in one batch
  const categoryNames = categoryMappings.map((m) => m.category);
  const productsByCategory = await getProductsByCategories(categoryNames, 3);

  // Related industries (exclude current)
  const relatedIndustries = INDUSTRIES.filter(
    (i) => i.slug !== industry.slug
  ).slice(0, 6);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://saasipedia.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: industry.name,
        item: `https://saasipedia.com/industry/${industry.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{industry.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          Software for {industry.name} Businesses
        </h1>
        <p className="text-wiki-text-muted max-w-2xl">
          {industry.description}
        </p>
      </div>

      {/* Business Type Filter */}
      <div className="mb-8">
        <BusinessTypeFilter
          industrySlug={industry.slug}
          businessTypes={industry.businessTypes}
        />
        {selectedBusinessType && (
          <p className="text-sm text-wiki-text-muted mt-3">
            Showing software recommendations for{' '}
            <span className="font-medium text-wiki-text">
              {selectedBusinessType.name}
            </span>{' '}
            &mdash; {selectedBusinessType.description}
          </p>
        )}
      </div>

      {/* Category Cards Grid */}
      {categoryMappings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {categoryMappings.map((mapping) => (
            <IndustryCategoryCard
              key={mapping.category}
              categoryName={mapping.category}
              relevance={mapping.relevance}
              reason={mapping.reason}
              products={productsByCategory[mapping.category] || []}
              industrySlug={industry.slug}
              businessTypeSlug={selectedType}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-wiki-text-muted mb-12">
          <p>No category recommendations found for this selection.</p>
        </div>
      )}

      {/* Related Industries */}
      {relatedIndustries.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mb-10">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">
            Other Industries
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedIndustries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industry/${ind.slug}`}
                className="px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt
                  text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent
                  transition-all"
              >
                {ind.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="max-w-xl mx-auto">
        <NewsletterSignup source={`industry-${industry.slug}`} />
      </div>
    </div>
  );
}
