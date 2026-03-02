# Homepage & Industry Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign SaaSipedia homepage to lead with industry/business-type discovery, add `/industry/[slug]` pages with business type filtering and ReapLabs "build your own" CTAs, and move stats to the bottom.

**Architecture:** Static TypeScript taxonomy file (`lib/industries.ts`) maps industries → business types → software categories. Industry pages query existing Supabase product data using category names from the taxonomy. No new DB tables. Homepage restructured: search hero → industry grid → software categories → stats/newsletter.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS (wiki-* design tokens), Supabase (existing), lucide-react icons.

---

### Task 1: Create Industry Taxonomy Data

**Files:**
- Create: `lib/industries.ts`

**Step 1: Create the types and data file**

Create `lib/industries.ts` with exported types and a full `INDUSTRIES` array. The `category` field in each `CategoryMapping` must match exact category names from the Supabase `reaper_products.category` column. Since we can't query live data at build time for the taxonomy, use the category names visible in the existing `getCategories()` results. Categories are stored as display names (e.g., "CRM", "Project Management"), not slugs.

```typescript
// lib/industries.ts

export interface BusinessType {
  name: string;
  slug: string;
  description: string;
}

export interface CategoryMapping {
  category: string;             // must match reaper_products.category exactly
  relevance: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  businessTypes?: string[];     // if set, only show for these business type slugs
}

export interface Industry {
  name: string;
  slug: string;
  icon: string;                 // lucide-react icon name
  description: string;
  businessTypes: BusinessType[];
  categoryMappings: CategoryMapping[];
}

export const INDUSTRIES: Industry[] = [
  // 12 industries with full mappings - see step 2
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getIndustryCategories(
  industry: Industry,
  businessTypeSlug?: string
): CategoryMapping[] {
  if (!businessTypeSlug || businessTypeSlug === 'all') {
    return industry.categoryMappings
      .filter((m) => !m.businessTypes)
      .sort((a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance));
  }

  return industry.categoryMappings
    .filter((m) => !m.businessTypes || m.businessTypes.includes(businessTypeSlug))
    .sort((a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance));
}

function relevanceOrder(r: CategoryMapping['relevance']): number {
  return r === 'essential' ? 0 : r === 'recommended' ? 1 : 2;
}
```

**Step 2: Populate all 12 industries**

Each industry needs:
- 3-5 business types
- 6-12 category mappings with relevance levels and reasons
- Some mappings scoped to specific business types

Industries to populate:
1. Healthcare
2. Financial Services
3. Legal
4. Real Estate
5. Restaurant & Hospitality
6. Retail & E-Commerce
7. Professional Services
8. Construction & Trades
9. Education
10. Fitness & Wellness
11. Home Services
12. Technology & SaaS

For the `category` values: use broad, common SaaS category names that are likely in the database (CRM, Project Management, Accounting, Marketing Automation, HR, Help Desk, Scheduling, etc.). The industry page will do a fuzzy match via `ilike` if exact match fails, so reasonable guesses are fine. Include a comment at the top of the file noting that category names should be validated against the live database.

Use these lucide-react icon names:
- Healthcare: `Heart`
- Financial Services: `Landmark`
- Legal: `Scale`
- Real Estate: `Home`
- Restaurant & Hospitality: `UtensilsCrossed`
- Retail & E-Commerce: `ShoppingBag`
- Professional Services: `Briefcase`
- Construction & Trades: `HardHat`
- Education: `GraduationCap`
- Fitness & Wellness: `Dumbbell`
- Home Services: `Wrench`
- Technology & SaaS: `Code`

**Step 3: Commit**

```bash
git add lib/industries.ts
git commit -m "feat: add industry taxonomy data with 12 industries and category mappings"
```

---

### Task 2: Add Data Helper for Industry Page Products

**Files:**
- Modify: `lib/data.ts` (add one new function)

**Step 1: Add `getProductsByCategories` function**

Add to the bottom of `lib/data.ts`:

```typescript
export async function getProductsByCategories(
  categoryNames: string[],
  limitPerCategory: number = 3
): Promise<Record<string, Product[]>> {
  if (categoryNames.length === 0) return {};

  const { data, error } = await supabase
    .from('reaper_products')
    .select('*')
    .eq('is_active', true)
    .in('category', categoryNames)
    .order('quality_score', { ascending: false });

  if (error || !data) return {};

  const result: Record<string, Product[]> = {};
  for (const product of data as Product[]) {
    const cat = product.category;
    if (!cat) continue;
    if (!result[cat]) result[cat] = [];
    if (result[cat].length < limitPerCategory) {
      result[cat].push(product);
    }
  }

  return result;
}
```

This fetches products for multiple categories in a single query, then groups and limits them. Used by the industry page to show top products per recommended category.

**Step 2: Commit**

```bash
git add lib/data.ts
git commit -m "feat: add getProductsByCategories helper for industry pages"
```

---

### Task 3: Build Industry Page

**Files:**
- Create: `app/industry/[slug]/page.tsx`
- Create: `components/BusinessTypeFilter.tsx` (client component for pill filtering)
- Create: `components/IndustryCategoryCard.tsx` (server-compatible card component)

**Step 1: Create the BusinessTypeFilter client component**

`components/BusinessTypeFilter.tsx` — a `'use client'` component that renders business type pills and manages selected state via URL search params (so it's shareable/bookmarkable).

```typescript
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
    if (slug === 'all') {
      router.push(`/industry/${industrySlug}`, { scroll: false });
    } else {
      router.push(`/industry/${industrySlug}?type=${slug}`, { scroll: false });
    }
  }

  const allTypes = [
    { name: `All`, slug: 'all', description: '' },
    ...businessTypes,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {allTypes.map((bt) => (
        <button
          key={bt.slug}
          onClick={() => handleSelect(bt.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            selected === bt.slug
              ? 'bg-wiki-accent text-white border-wiki-accent'
              : 'bg-white text-wiki-text-muted border-wiki-border hover:border-wiki-accent hover:text-wiki-accent'
          }`}
        >
          {bt.name}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Create the IndustryCategoryCard component**

`components/IndustryCategoryCard.tsx` — renders a single recommended category card with products and "build your own" link.

```typescript
import Link from 'next/link';
import { ArrowRight, Hammer } from 'lucide-react';
import type { Product } from '@/lib/data';
import { slugifyCategory } from '@/lib/data';

interface IndustryCategoryCardProps {
  categoryName: string;
  relevance: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  products: Product[];
  industrySlug: string;
  businessTypeSlug?: string;
}

const relevanceBadge = {
  essential: { label: 'Essential', className: 'bg-green-100 text-green-700' },
  recommended: { label: 'Recommended', className: 'bg-blue-100 text-blue-700' },
  'nice-to-have': { label: 'Nice to Have', className: 'bg-gray-100 text-gray-600' },
};

export default function IndustryCategoryCard({
  categoryName,
  relevance,
  reason,
  products,
  industrySlug,
  businessTypeSlug,
}: IndustryCategoryCardProps) {
  const badge = relevanceBadge[relevance];
  const categorySlug = slugifyCategory(categoryName);
  const reapUrl = process.env.NEXT_PUBLIC_REAP_URL || 'https://reaplabs.ai';
  const reapParams = new URLSearchParams({
    category: categorySlug,
    industry: industrySlug,
    ...(businessTypeSlug && businessTypeSlug !== 'all' ? { business: businessTypeSlug } : {}),
  });

  return (
    <div className="wiki-card">
      <div className="flex items-center justify-between mb-2">
        <Link
          href={`/category/${categorySlug}`}
          className="text-base font-semibold text-wiki-text hover:text-wiki-accent transition-colors"
        >
          {categoryName}
        </Link>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <p className="text-sm text-wiki-text-muted mb-3">{reason}</p>

      {products.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/wiki/${p.slug}`}
              className="flex items-center justify-between text-sm group"
            >
              <span className="text-wiki-text group-hover:text-wiki-accent transition-colors">
                {p.name}
              </span>
              <span className="text-xs text-wiki-text-muted">{p.feature_count} features</span>
            </Link>
          ))}
          <Link
            href={`/category/${categorySlug}`}
            className="text-xs text-wiki-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {products.length === 0 && (
        <p className="text-xs text-wiki-text-muted mb-3 italic">
          No products cataloged yet in this category.
        </p>
      )}

      <a
        href={`${reapUrl}/reap/start?${reapParams.toString()}`}
        className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
      >
        <Hammer className="w-3 h-3" />
        Or build your own
      </a>
    </div>
  );
}
```

**Step 3: Create the industry page**

`app/industry/[slug]/page.tsx`:

```typescript
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
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) return {};

  return {
    title: `Software for ${industry.name} Businesses`,
    description: `Discover the best software categories for ${industry.name.toLowerCase()} businesses. ${industry.description}`,
    alternates: { canonical: `/industry/${params.slug}` },
    openGraph: {
      title: `Software for ${industry.name} Businesses | SaaSipedia`,
      description: `Discover the best software categories for ${industry.name.toLowerCase()} businesses.`,
    },
  };
}

export default async function IndustryPage({ params, searchParams }: PageProps) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  const selectedType = searchParams.type || 'all';
  const mappings = getIndustryCategories(industry, selectedType);
  const categoryNames = mappings.map((m) => m.category);

  const productsByCategory = await getProductsByCategories(categoryNames, 3);

  const otherIndustries = INDUSTRIES.filter((i) => i.slug !== industry.slug).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{industry.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">
          Software for {industry.name} Businesses
        </h1>
        <p className="text-wiki-text-muted">{industry.description}</p>
      </div>

      {/* Business Type Filter */}
      <div className="mb-8">
        <BusinessTypeFilter
          industrySlug={industry.slug}
          businessTypes={industry.businessTypes}
        />
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {mappings.map((mapping) => (
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

      {/* Related Industries */}
      {otherIndustries.length > 0 && (
        <div className="border-t border-wiki-border pt-8 mb-8">
          <h2 className="text-lg font-semibold text-wiki-text mb-4">Explore Other Industries</h2>
          <div className="flex flex-wrap gap-2">
            {otherIndustries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industry/${ind.slug}`}
                className="px-3 py-1.5 rounded-md border border-wiki-border bg-wiki-bg-alt
                  text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-all"
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
```

**Step 4: Verify the industry page builds**

Run: `cd /Users/dougkvamme/reap/saasipedia && npx next build`

Check for TypeScript errors and build success. Fix any issues.

**Step 5: Commit**

```bash
git add components/BusinessTypeFilter.tsx components/IndustryCategoryCard.tsx app/industry/
git commit -m "feat: add industry pages with business type filtering and ReapLabs CTA"
```

---

### Task 4: Redesign Homepage

**Files:**
- Modify: `app/page.tsx` (full rewrite)

**Step 1: Rewrite the homepage**

Replace `app/page.tsx` with the new structure:
- Hero: title, subtitle ("Find the right software for your business"), search bar, no stats
- Industry grid: "What kind of business do you run?" with 12 industry cards
- Software categories: "Or browse by software category" with existing category grid
- Stats + Newsletter at bottom

```typescript
import Link from 'next/link';
import { ArrowRight, Layers, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import NewsletterSignup from '@/components/NewsletterSignup';
import { INDUSTRIES } from '@/lib/industries';
import {
  getCategories,
  getTotalProductCount,
  getTotalCategoryCount,
} from '@/lib/data';

export const revalidate = 3600;

// Dynamic icon lookup for industries
function IndustryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export default async function HomePage() {
  const [categories, productCount, categoryCount] = await Promise.all([
    getCategories(),
    getTotalProductCount(),
    getTotalCategoryCount(),
  ]);

  const topCategories = categories.slice(0, 12);

  return (
    <div>
      {/* Hero */}
      <section className="bg-wiki-bg-alt border-b border-wiki-border">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-wiki-text mb-3">
            SaaSipedia
          </h1>
          <p className="text-lg text-wiki-text-muted mb-8">
            Find the right software for your business
          </p>
          <div className="flex justify-center">
            <SearchBar size="lg" placeholder="Search products, categories, features..." />
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-wiki-text mb-6">
          What kind of business do you run?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {INDUSTRIES.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industry/${industry.slug}`}
              className="wiki-card text-center group"
            >
              <div className="flex justify-center mb-2">
                <IndustryIcon
                  name={industry.icon}
                  className="w-6 h-6 text-wiki-text-muted group-hover:text-wiki-accent transition-colors"
                />
              </div>
              <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                {industry.name}
              </div>
              <div className="text-xs text-wiki-text-muted mt-1">
                {industry.businessTypes.length} business types
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Software Categories */}
      {topCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-wiki-text">
              Or browse by software category
            </h2>
            <Link href="/categories" className="wiki-link text-sm flex items-center gap-1">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="wiki-card text-center group"
              >
                <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                  {cat.category}
                </div>
                <div className="text-xs text-wiki-text-muted mt-1">
                  {cat.count} {cat.count === 1 ? 'product' : 'products'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-8">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-wiki-text-muted">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>
              Covering <strong className="text-wiki-text">{productCount.toLocaleString()}</strong> products
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            <span>
              across <strong className="text-wiki-text">{categoryCount}</strong> categories
            </span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <NewsletterSignup source="homepage" />
      </section>
    </div>
  );
}
```

Note: Removes `getFeaturedProducts`, `getRecentProducts`, `getTotalFeatureCount` imports since they're no longer used on the homepage. The recently updated products section is removed — those products are still accessible via categories and search.

**Step 2: Verify the homepage builds and renders**

Run: `cd /Users/dougkvamme/reap/saasipedia && npx next build`

Check for TypeScript errors and build success. Fix any issues.

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign homepage with industry-first discovery and search hero"
```

---

### Task 5: Add Industries Link to Navigation

**Files:**
- Modify: `components/Header.tsx`

**Step 1: Add "Industries" nav link**

Add an "Industries" link to both desktop and mobile nav, pointing to `/#industries` (anchor to industry grid section on homepage). Or better, since we don't have a standalone industries listing page yet, just link to the homepage. Actually, add it as a link that scrolls to the industry section. For simplicity, just add a nav item that links to `/` with text "Industries" — positioned first in the nav.

In the desktop nav section, add before "Categories":
```tsx
<Link
  href="/"
  className="text-wiki-text-muted hover:text-wiki-text transition-colors"
>
  Industries
</Link>
```

Do the same in the mobile nav dropdown.

**Step 2: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add Industries link to site navigation"
```

---

### Task 6: Verify Full Build and Test

**Step 1: Run full build**

```bash
cd /Users/dougkvamme/reap/saasipedia && npx next build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Run dev server and verify pages**

```bash
cd /Users/dougkvamme/reap/saasipedia && npx next dev
```

Verify:
- Homepage loads with search bar, industry grid, category grid, stats at bottom
- Clicking an industry card navigates to `/industry/[slug]`
- Industry page shows business type pills, category cards with products, "build your own" links
- Clicking business type pills filters the categories
- All existing pages (categories, wiki, search) still work

**Step 3: Fix any issues found**

**Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address build and render issues from homepage redesign"
```
