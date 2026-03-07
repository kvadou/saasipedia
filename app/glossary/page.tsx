import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Sparkles } from 'lucide-react';
import { getFeatureGlossaryTerms } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Software Feature Glossary',
  description:
    'A comprehensive glossary of SaaS software features. Understand what each feature does and which products offer it.',
  alternates: { canonical: '/glossary' },
};

export default async function GlossaryPage() {
  const terms = await getFeatureGlossaryTerms(300);

  // Group by first letter
  const grouped: Record<string, typeof terms> = {};
  for (const term of terms) {
    const letter = term.name[0]?.toUpperCase() || '#';
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }
  const letters = Object.keys(grouped).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Feature Glossary</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">Software Feature Glossary</h1>
        <p className="text-wiki-text-muted max-w-2xl">
          A reference guide to common SaaS features. Learn what each feature does and see which products include it.
        </p>
      </div>

      {/* Letter jump nav */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center rounded border border-wiki-border text-sm font-medium text-wiki-text hover:bg-wiki-accent hover:text-white hover:border-wiki-accent transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms by letter */}
      {letters.map((letter) => (
        <section key={letter} id={`letter-${letter}`} className="mb-8 scroll-mt-20">
          <h2 className="text-lg font-bold text-wiki-text mb-3 pb-2 border-b border-wiki-border">
            {letter}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {grouped[letter].map((term) => (
              <Link
                key={term.slug}
                href={`/glossary/${term.slug}`}
                className="flex items-center justify-between p-3 rounded-lg border border-wiki-border hover:border-wiki-accent/30 hover:bg-wiki-bg-alt transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors truncate">
                    {term.name}
                  </span>
                  {term.isAiPowered && (
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-wiki-text-muted shrink-0 ml-2">
                  {term.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
