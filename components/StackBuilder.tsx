'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface Industry {
  slug: string;
  name: string;
  icon: string;
  description: string;
  businessTypes: { slug: string; name: string }[];
  categoryMappings: {
    category: string;
    relevance: 'essential' | 'recommended' | 'nice-to-have';
    reason: string;
  }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  feature_count: number;
}

interface StackBuilderProps {
  industries: Industry[];
  productsByCategory: Record<string, Product[]>;
}

function IndustryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const relevanceColors = {
  essential: 'border-green-200 bg-green-50',
  recommended: 'border-blue-200 bg-blue-50',
  'nice-to-have': 'border-gray-200 bg-gray-50',
};

const relevanceLabels = {
  essential: { label: 'Essential', className: 'bg-green-100 text-green-700' },
  recommended: { label: 'Recommended', className: 'bg-blue-100 text-blue-700' },
  'nice-to-have': { label: 'Nice to Have', className: 'bg-gray-100 text-gray-600' },
};

export default function StackBuilder({ industries, productsByCategory }: StackBuilderProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  if (!selectedIndustry) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {industries.map((industry) => (
            <button
              key={industry.slug}
              onClick={() => setSelectedIndustry(industry)}
              className="wiki-card text-center group cursor-pointer"
            >
              <IndustryIcon
                name={industry.icon}
                className="w-6 h-6 mx-auto mb-2 text-wiki-text-muted group-hover:text-wiki-accent transition-colors"
              />
              <div className="text-sm font-medium text-wiki-text group-hover:text-wiki-accent transition-colors">
                {industry.name}
              </div>
              <div className="text-xs text-wiki-text-muted mt-1">
                {industry.categoryMappings.length} categories
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const essential = selectedIndustry.categoryMappings.filter((m) => m.relevance === 'essential');
  const recommended = selectedIndustry.categoryMappings.filter((m) => m.relevance === 'recommended');
  const niceToHave = selectedIndustry.categoryMappings.filter((m) => m.relevance === 'nice-to-have');

  const sections = [
    { title: 'Essential', subtitle: 'You need these.', items: essential, key: 'essential' as const },
    { title: 'Recommended', subtitle: 'Strong additions to your stack.', items: recommended, key: 'recommended' as const },
    { title: 'Nice to Have', subtitle: 'Consider as you grow.', items: niceToHave, key: 'nice-to-have' as const },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      {/* Selected industry header */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-wiki-bg-alt border border-wiki-border">
        <div className="flex items-center gap-3">
          <IndustryIcon name={selectedIndustry.icon} className="w-6 h-6 text-wiki-accent" />
          <div>
            <h2 className="font-semibold text-wiki-text">{selectedIndustry.name} Software Stack</h2>
            <p className="text-sm text-wiki-text-muted">{selectedIndustry.categoryMappings.length} software categories</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedIndustry(null)}
          className="text-sm text-wiki-accent hover:text-wiki-accent-hover transition-colors"
        >
          Change industry
        </button>
      </div>

      {/* Stack sections */}
      {sections.map((section) => (
        <div key={section.key} className="mb-8">
          <h3 className="text-lg font-semibold text-wiki-text mb-1">{section.title}</h3>
          <p className="text-sm text-wiki-text-muted mb-4">{section.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((mapping) => {
              const products = productsByCategory[mapping.category] || [];
              const catSlug = slugifyCategory(mapping.category);

              return (
                <div
                  key={mapping.category}
                  className={`rounded-lg border p-4 ${relevanceColors[mapping.relevance]}`}
                >
                  <Link
                    href={`/category/${catSlug}?industry=${selectedIndustry.slug}`}
                    className="text-base font-semibold text-wiki-text hover:text-wiki-accent transition-colors"
                  >
                    {mapping.category}
                  </Link>
                  <p className="text-xs text-wiki-text-muted mt-1 mb-3 line-clamp-2">{mapping.reason}</p>

                  {products.length > 0 && (
                    <div className="space-y-1.5">
                      {products.map((p, i) => (
                        <Link
                          key={p.slug}
                          href={`/wiki/${p.slug}`}
                          className="flex items-center gap-2 text-sm group"
                        >
                          <span className="text-xs font-semibold text-wiki-accent w-4 text-right">{i + 1}</span>
                          <span className="text-wiki-text group-hover:text-wiki-accent transition-colors truncate">
                            {p.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/category/${catSlug}?industry=${selectedIndustry.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-wiki-accent hover:underline mt-3"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="mt-8 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <p className="text-wiki-text-muted mb-3">
          Want to explore this stack in more detail?
        </p>
        <Link
          href={`/industry/${selectedIndustry.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-wiki-accent text-white font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
        >
          View Full {selectedIndustry.name} Guide
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
