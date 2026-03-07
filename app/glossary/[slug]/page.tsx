import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { getFeatureGlossaryTerm, slugifyCategory } from '@/lib/data';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const term = await getFeatureGlossaryTerm(params.slug);
  if (!term) return { title: 'Not Found' };

  return {
    title: `${term.name} — Software Feature Explained`,
    description: term.description || `Learn what ${term.name} is and which SaaS products include this feature. ${term.products.length} products with ${term.name}.`,
    alternates: { canonical: `/glossary/${params.slug}` },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const term = await getFeatureGlossaryTerm(params.slug);
  if (!term) notFound();

  // Group products by category
  const byCategory: Record<string, typeof term.products> = {};
  for (const p of term.products) {
    const cat = p.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }
  const categoryNames = Object.keys(byCategory).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/glossary" className="hover:text-wiki-accent transition-colors">Glossary</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">{term.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-wiki-text">{term.name}</h1>
          {term.isAiPowered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3" />
              AI-Powered Feature
            </span>
          )}
        </div>
        <p className="text-wiki-text-muted">
          Found in {term.products.length} {term.products.length === 1 ? 'product' : 'products'} on SaaSipedia.
        </p>
      </div>

      {/* Description */}
      {term.description && (
        <div className="mb-8 p-5 rounded-lg bg-wiki-bg-alt border border-wiki-border">
          <h2 className="text-base font-semibold text-wiki-text mb-2">What is {term.name}?</h2>
          <p className="text-sm text-wiki-text-muted leading-relaxed">{term.description}</p>
        </div>
      )}

      {/* Products by category */}
      <section>
        <h2 className="text-xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border">
          Products with {term.name}
        </h2>

        {categoryNames.map((cat) => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-semibold text-wiki-text-muted uppercase tracking-wider mb-2">
              {cat}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {byCategory[cat].map((p) => (
                <Link
                  key={p.slug}
                  href={`/wiki/${p.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-wiki-border hover:border-wiki-accent/30 hover:bg-wiki-bg-alt transition-all group"
                >
                  <span className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                    {p.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-wiki-text-muted group-hover:text-wiki-accent transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Back to glossary */}
      <div className="mt-8 pt-6 border-t border-wiki-border">
        <Link href="/glossary" className="inline-flex items-center gap-1 text-sm wiki-link">
          ← Back to Feature Glossary
        </Link>
      </div>
    </div>
  );
}
