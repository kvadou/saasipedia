import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ChevronRight,
  Hammer,
  ArrowRight,
  Clock,
  Layers,
  Tag,
  Sparkles,
  Crown,
  Wrench,
  Search,
  Code2,
  Rocket,
} from 'lucide-react';
import BuildScore from '@/components/BuildScore';
import CostCalculator from '@/components/CostCalculator';
import {
  getProductBySlug,
  getTopProductSlugs,
  calculateBuildScore,
  slugifyCategory,
  type Feature,
} from '@/lib/data';

export async function generateStaticParams() {
  const slugs = await getTopProductSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Not Found' };

  const buildScore = calculateBuildScore(product);
  const featureCount = product.features.length;

  return {
    title: `How to Build Your Own ${product.name} | SaaSipedia`,
    description: `Step-by-step guide to replacing ${product.name} with a custom build. ${featureCount} features, estimated ${buildScore.label.toLowerCase()}, difficulty: ${buildScore.score}/5.`,
    alternates: {
      canonical: `/wiki/${params.slug}/replace`,
    },
    openGraph: {
      title: `How to Build Your Own ${product.name} | SaaSipedia`,
      description: `Step-by-step guide to replacing ${product.name} with a custom build. ${featureCount} features, estimated ${buildScore.label.toLowerCase()}, difficulty: ${buildScore.score}/5.`,
      type: 'article',
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupFeatures(features: Feature[]): Record<string, Feature[]> {
  const groups: Record<string, Feature[]> = {};
  for (const f of features) {
    const cat = f.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  }
  return groups;
}

function getRecommendedStack(category: string | null): { name: string; why: string }[] {
  const base = [
    { name: 'Next.js 14', why: 'Full-stack React framework with API routes and server components' },
    { name: 'Supabase', why: 'PostgreSQL database, auth, and real-time subscriptions' },
    { name: 'Tailwind CSS', why: 'Utility-first styling for rapid UI development' },
  ];

  const cat = (category || '').toLowerCase();

  if (['ecommerce', 'e-commerce', 'payments', 'billing'].some((k) => cat.includes(k))) {
    base.push({ name: 'Stripe', why: 'Payment processing, subscriptions, and invoicing' });
  }

  if (['crm', 'hr', 'erp', 'project management', 'operations'].some((k) => cat.includes(k))) {
    base.push({ name: 'Prisma', why: 'Type-safe ORM for complex relational data models' });
  }

  if (['communication', 'messaging', 'collaboration', 'chat'].some((k) => cat.includes(k))) {
    base.push({ name: 'Pusher / WebSockets', why: 'Real-time messaging and live updates' });
  }

  if (['email', 'marketing automation', 'email marketing'].some((k) => cat.includes(k))) {
    base.push({ name: 'Resend', why: 'Transactional and marketing email delivery' });
  }

  if (['file', 'storage', 'document'].some((k) => cat.includes(k))) {
    base.push({ name: 'Supabase Storage', why: 'File uploads and CDN-backed object storage' });
  }

  return base;
}

function getTimeline(score: number): { duration: string; phases: { name: string; time: string }[] } {
  switch (score) {
    case 5:
      return {
        duration: 'One weekend',
        phases: [
          { name: 'Setup & scaffolding', time: '2 hours' },
          { name: 'Core features', time: '4-6 hours' },
          { name: 'Polish & deploy', time: '2 hours' },
        ],
      };
    case 4:
      return {
        duration: '3-5 days',
        phases: [
          { name: 'Architecture & setup', time: 'Half day' },
          { name: 'Core features', time: '2-3 days' },
          { name: 'Testing & polish', time: '1 day' },
        ],
      };
    case 3:
      return {
        duration: '1-2 weeks',
        phases: [
          { name: 'Planning & architecture', time: '1-2 days' },
          { name: 'Core features (Phase 1)', time: '3-4 days' },
          { name: 'Advanced features (Phase 2)', time: '3-4 days' },
          { name: 'Testing & deployment', time: '1-2 days' },
        ],
      };
    case 2:
      return {
        duration: '2-4 weeks',
        phases: [
          { name: 'Architecture & planning', time: '2-3 days' },
          { name: 'Core platform (Phase 1)', time: '1 week' },
          { name: 'Feature parity (Phase 2)', time: '1 week' },
          { name: 'Integrations (Phase 3)', time: '3-5 days' },
          { name: 'Testing & hardening', time: '2-3 days' },
        ],
      };
    case 1:
    default:
      return {
        duration: '1-2 months',
        phases: [
          { name: 'Research & architecture', time: '1 week' },
          { name: 'Core platform (Phase 1)', time: '2 weeks' },
          { name: 'Feature depth (Phase 2)', time: '2 weeks' },
          { name: 'Integrations & APIs (Phase 3)', time: '1 week' },
          { name: 'Testing, security & deployment', time: '1 week' },
        ],
      };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReplacementGuidePage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const buildScore = calculateBuildScore(product);
  const featureGroups = groupFeatures(product.features);
  const sortedCategories = Object.entries(featureGroups)
    .sort((a, b) => b[1].length - a[1].length);
  const topCategories = sortedCategories.slice(0, 8);

  const techStack = getRecommendedStack(product.normalized_category);
  const timeline = getTimeline(buildScore.score);

  const reapUrl = process.env.NEXT_PUBLIC_REAP_URL || 'https://reaplabs.ai';
  const shipyardUrl = process.env.NEXT_PUBLIC_SHIPYARD_URL || 'https://shipyard.reaplabs.ai';

  const lowestPrice = product.pricing_tiers
    .map((t) => t.price_monthly)
    .filter((p): p is number => p != null && p > 0)
    .sort((a, b) => a - b)[0];

  // Structured data (JSON-LD) -- all values are from our own database, not user input
  const structuredData = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Build Your Own ${product.name}`,
      description: `A guide to replacing ${product.name} with a custom-built alternative using modern tools.`,
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '20' },
      totalTime: timeline.duration,
      step: timeline.phases.map((phase, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: phase.name,
        text: `${phase.name} (${phase.time})`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://saasipedia.com' },
        ...(product.normalized_category
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: product.normalized_category,
                item: `https://saasipedia.com/category/${slugifyCategory(product.normalized_category)}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `https://saasipedia.com/wiki/${product.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: 'Replacement Guide',
                item: `https://saasipedia.com/wiki/${product.slug}/replace`,
              },
            ]
          : [
              {
                '@type': 'ListItem',
                position: 2,
                name: product.name,
                item: `https://saasipedia.com/wiki/${product.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Replacement Guide',
                item: `https://saasipedia.com/wiki/${product.slug}/replace`,
              },
            ]),
      ],
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.normalized_category && (
          <>
            <Link
              href={`/category/${slugifyCategory(product.normalized_category)}`}
              className="hover:text-wiki-accent transition-colors"
            >
              {product.normalized_category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <Link href={`/wiki/${product.slug}`} className="hover:text-wiki-accent transition-colors">
          {product.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Replacement Guide</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-wiki-accent font-medium mb-2">
          <Hammer className="w-4 h-4" />
          Replacement Guide
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-wiki-text mb-3">
          How to Build Your Own {product.name}
        </h1>
        <p className="text-lg text-wiki-text-muted mb-4">
          {product.tagline
            ? `Replace ${product.name} with a custom build. ${product.tagline}`
            : `Everything you need to replace ${product.name} with a custom-built alternative.`}
        </p>

        {/* Quick stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          <BuildScore buildScore={buildScore} />
          <span className="text-sm text-wiki-text-muted">
            {product.features.length} features
          </span>
          <span className="text-sm text-wiki-text-muted">
            {product.integrations.length} integrations
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-wiki-text-muted">
            <Clock className="w-3.5 h-3.5" />
            {timeline.duration}
          </span>
        </div>
      </div>

      {/* Estimated Timeline */}
      <section className="wiki-section">
        <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border flex items-center gap-2">
          <Clock className="w-5 h-5 text-wiki-accent" />
          Estimated Timeline
        </h2>
        <p className="text-wiki-text-muted mb-4">
          Based on {product.features.length} features at{' '}
          <span className="font-medium text-wiki-text">{buildScore.label}</span> difficulty,
          expect about <span className="font-medium text-wiki-text">{timeline.duration}</span> with AI-assisted development.
        </p>

        <div className="space-y-3">
          {timeline.phases.map((phase, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg border border-wiki-border bg-wiki-bg-alt"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-wiki-accent font-bold text-sm flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-wiki-text text-sm">{phase.name}</span>
              </div>
              <span className="text-sm text-wiki-text-muted shrink-0">{phase.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Tech Stack */}
      <section className="wiki-section">
        <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border flex items-center gap-2">
          <Layers className="w-5 h-5 text-wiki-accent" />
          Recommended Tech Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-lg border border-wiki-border bg-wiki-bg-alt"
            >
              <div className="font-semibold text-wiki-text text-sm mb-1">{tech.name}</div>
              <p className="text-xs text-wiki-text-muted">{tech.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features to Replicate */}
      <section className="wiki-section">
        <h2 className="text-2xl font-semibold text-wiki-text mb-1 pb-2 border-b border-wiki-border flex items-center gap-2">
          <Code2 className="w-5 h-5 text-wiki-accent" />
          Key Features to Replicate
        </h2>
        <p className="text-sm text-wiki-text-muted mb-4">
          Top features across{' '}
          {topCategories.length} categories.{' '}
          <Link href={`/wiki/${product.slug}#features`} className="wiki-link">
            See all {product.features.length} features
          </Link>
        </p>

        {topCategories.map(([cat, features]) => {
          const displayFeatures = features.slice(0, 5);
          return (
            <div key={cat} className="mb-5">
              <h3 className="text-base font-semibold text-wiki-text mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-wiki-indigo" />
                {cat}
                <span className="text-sm font-normal text-wiki-text-muted">
                  ({features.length} features)
                </span>
              </h3>
              <div className="space-y-1.5">
                {displayFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="pl-4 border-l-2 border-wiki-border py-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-wiki-text text-sm">
                        {feature.name}
                      </span>
                      {feature.is_ai_powered && (
                        <span className="wiki-badge-ai">
                          <Sparkles className="w-3 h-3 mr-0.5" />
                          AI
                        </span>
                      )}
                      {feature.is_premium && (
                        <span className="wiki-badge-premium">
                          <Crown className="w-3 h-3 mr-0.5" />
                          Premium
                        </span>
                      )}
                    </div>
                    {feature.description && (
                      <p className="text-xs text-wiki-text-muted mt-0.5">
                        {feature.description}
                      </p>
                    )}
                  </div>
                ))}
                {features.length > 5 && (
                  <p className="pl-4 text-xs text-wiki-text-muted">
                    +{features.length - 5} more in this category
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Cost Calculator */}
      <CostCalculator
        productName={product.name}
        featureCount={product.features.length}
        buildScore={buildScore.score}
        lowestPaidPrice={lowestPrice ?? null}
        productSlug={product.slug}
      />

      {/* CTAs */}
      <section className="wiki-section">
        <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border flex items-center gap-2">
          <Rocket className="w-5 h-5 text-wiki-accent" />
          Ready to Build?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Analyze with Reap */}
          <a
            href={`${reapUrl}/?q=${encodeURIComponent(product.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-5 rounded-lg border border-wiki-border bg-wiki-bg-alt
              hover:border-wiki-accent hover:shadow-sm transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-wiki-accent" />
            </div>
            <span className="font-semibold text-wiki-text text-sm">Analyze with Reap</span>
            <span className="text-xs text-wiki-text-muted">
              Get a detailed feature matrix and implementation prompts
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-wiki-accent font-medium mt-1 group-hover:gap-2 transition-all">
              Start Analysis <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Start Building */}
          <a
            href={`${shipyardUrl}/build?product=${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-wiki-accent bg-blue-50/50
              hover:shadow-md transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-wiki-accent flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-wiki-text text-sm">Start Building in ShipYard</span>
            <span className="text-xs text-wiki-text-muted">
              Track your build phase by phase with AI assistance
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-wiki-accent font-medium mt-1 group-hover:gap-2 transition-all">
              Start Building <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Get It Built */}
          <a
            href={`${reapUrl}/consulting?product=${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-5 rounded-lg border border-wiki-border bg-wiki-bg-alt
              hover:border-wiki-accent hover:shadow-sm transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-semibold text-wiki-text text-sm">Get It Built</span>
            <span className="text-xs text-wiki-text-muted">
              Hire an expert to build your replacement for you
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1 group-hover:gap-2 transition-all">
              Book a Sprint <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </section>

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-wiki-border">
        <Link
          href={`/wiki/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-sm wiki-link"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          Back to {product.name} overview
        </Link>
      </div>
    </div>
  );
}
