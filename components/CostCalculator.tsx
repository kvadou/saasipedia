'use client';

import { ArrowRight, Calculator, Server, Zap, TrendingDown } from 'lucide-react';

interface CostCalculatorProps {
  productName: string;
  featureCount: number;
  buildScore: number; // 1-5 (5 = easiest)
  lowestPaidPrice: number | null; // monthly price of cheapest non-free tier
  productSlug: string;
}

function getDifficultyMultiplier(score: number): number {
  switch (score) {
    case 5: return 0.5;
    case 4: return 0.75;
    case 3: return 1.0;
    case 2: return 1.5;
    case 1: return 2.0;
    default: return 1.0;
  }
}

function getDifficultyLabel(score: number): string {
  switch (score) {
    case 5: return 'Very Easy';
    case 4: return 'Easy';
    case 3: return 'Moderate';
    case 2: return 'Complex';
    case 1: return 'Very Complex';
    default: return 'Moderate';
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

const HOSTING_COST = 20; // $/month for Vercel + Supabase

export default function CostCalculator({
  productName,
  featureCount,
  buildScore,
  lowestPaidPrice,
  productSlug,
}: CostCalculatorProps) {
  const shipyardUrl =
    process.env.NEXT_PUBLIC_SHIPYARD_URL || 'https://shipyard.reaplabs.ai';
  const reapLabsUrl = 'https://reaplabs.ai';

  // Estimation logic
  const baseHours = featureCount * 0.15;
  const difficultyMultiplier = getDifficultyMultiplier(buildScore);
  const estimatedHours = Math.round(baseHours * difficultyMultiplier);

  const hasPricing = lowestPaidPrice != null && lowestPaidPrice > 0;
  const saasMonthly = lowestPaidPrice ?? 0;
  const monthlySavings = hasPricing ? saasMonthly - HOSTING_COST : 0;
  const breakEvenMonths =
    hasPricing && monthlySavings > 0
      ? Math.ceil(estimatedHours / monthlySavings) // rough: 1 hour ≈ $1 of effort time
      : null;

  // Cost projections
  const projections = [
    { label: '1 Year', months: 12 },
    { label: '3 Years', months: 36 },
    { label: '5 Years', months: 60 },
  ];

  return (
    <section id="cost-calculator" className="wiki-section scroll-mt-20">
      <h2 className="text-2xl font-semibold text-wiki-text mb-4 pb-2 border-b border-wiki-border flex items-center gap-2">
        <Calculator className="w-5 h-5 text-wiki-accent" />
        Cost Calculator
      </h2>

      {!hasPricing ? (
        <div className="rounded-lg border border-wiki-border bg-wiki-bg-alt p-6 text-center">
          <p className="text-wiki-text-muted">
            Pricing data not available for {productName}.{' '}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(productName + ' pricing')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wiki-link"
            >
              Check their website
            </a>{' '}
            for current pricing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Side-by-side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SaaS Cost card */}
            <div className="rounded-lg border border-wiki-border bg-wiki-bg-alt p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-wiki-text">
                  Keep Paying {productName}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">Monthly</span>
                  <span className="text-lg font-bold text-wiki-text">
                    ${saasMonthly}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">Yearly</span>
                  <span className="text-lg font-bold text-wiki-text">
                    {formatCurrency(saasMonthly * 12)}/yr
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">5-Year Total</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(saasMonthly * 60)}
                  </span>
                </div>
              </div>
            </div>

            {/* DIY Build card */}
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-wiki-text">Build It Yourself</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">Est. Build Time</span>
                  <span className="text-lg font-bold text-wiki-text">
                    ~{estimatedHours} hrs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">
                    Hosting
                  </span>
                  <span className="text-lg font-bold text-wiki-text">
                    ${HOSTING_COST}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wiki-text-muted">Difficulty</span>
                  <span className="text-lg font-bold text-green-600">
                    {getDifficultyLabel(buildScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost projection comparison */}
          <div className="rounded-lg border border-wiki-border bg-wiki-bg-alt p-5">
            <h3 className="font-semibold text-wiki-text mb-4">
              Total Cost Comparison
            </h3>
            <div className="space-y-4">
              {projections.map(({ label, months }) => {
                const saasCost = saasMonthly * months;
                const diyCost = HOSTING_COST * months;
                const savings = saasCost - diyCost;
                const maxCost = Math.max(saasCost, diyCost);
                const saasPercent = maxCost > 0 ? (saasCost / maxCost) * 100 : 0;
                const diyPercent = maxCost > 0 ? (diyCost / maxCost) * 100 : 0;

                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-wiki-text">
                        {label}
                      </span>
                      {savings > 0 && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Save {formatCurrency(savings)}
                        </span>
                      )}
                    </div>

                    {/* SaaS bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-wiki-text-muted w-12 shrink-0">
                        SaaS
                      </span>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(saasPercent, 8)}%` }}
                        >
                          <span className="text-[10px] font-medium text-white whitespace-nowrap">
                            {formatCurrency(saasCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DIY bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-wiki-text-muted w-12 shrink-0">
                        DIY
                      </span>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(diyPercent, 8)}%` }}
                        >
                          <span className="text-[10px] font-medium text-white whitespace-nowrap">
                            {formatCurrency(diyCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-wiki-text-muted mt-4">
              DIY hosting estimate based on Vercel + Supabase free/pro tiers (~${HOSTING_COST}/mo).
              Build time estimated from {featureCount} features at {getDifficultyLabel(buildScore).toLowerCase()} complexity.
            </p>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`${shipyardUrl}/wiki/${productSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-wiki-accent text-white
                font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
            >
              <Server className="w-4 h-4" />
              Start Building
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`${reapLabsUrl}/consulting?product=${encodeURIComponent(productSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-wiki-border
                text-wiki-text font-medium text-sm hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              Get It Built
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
