'use client';

import { useState } from 'react';
import { Calculator, DollarSign, Clock, Code } from 'lucide-react';

interface BuildVsBuyCalculatorProps {
  productName: string;
  productSlug: string;
  featureCount: number;
  lowestPaidPrice: number | null;
  buildScore: number; // 1-5 scale
}

// Rough estimation model
function estimateBuildCost(featureCount: number, buildScore: number): {
  devMonths: number;
  devCost: number;
  maintenanceMonthly: number;
} {
  // Base: ~2 days per feature for MVP, adjusted by complexity
  const complexityMultiplier = {
    1: 2.5,  // Very complex
    2: 2.0,
    3: 1.5,
    4: 1.0,
    5: 0.7,  // Simple
  }[Math.round(buildScore)] || 1.5;

  const devDays = Math.round(featureCount * 1.5 * complexityMultiplier);
  const devMonths = Math.max(1, Math.round(devDays / 22)); // 22 working days/month
  const devCost = devMonths * 12000; // ~$12k/month for a developer
  const maintenanceMonthly = Math.round(devCost * 0.015); // ~1.5% of build cost per month

  return { devMonths, devCost, maintenanceMonthly };
}

export default function BuildVsBuyCalculator({
  productName,
  productSlug,
  featureCount,
  lowestPaidPrice,
  buildScore,
}: BuildVsBuyCalculatorProps) {
  const [teamSize, setTeamSize] = useState(10);
  const [years, setYears] = useState(3);

  const build = estimateBuildCost(featureCount, buildScore);
  const buyMonthly = (lowestPaidPrice || 0) * teamSize;
  const buyTotal = buyMonthly * 12 * years;
  const buildTotal = build.devCost + (build.maintenanceMonthly * 12 * years);
  const savings = buildTotal - buyTotal;
  const buyWins = savings > 0;

  return (
    <section id="build-vs-buy" className="wiki-section">
      <h2 className="text-2xl font-semibold text-wiki-text mb-2 pb-2 border-b border-wiki-border flex items-center gap-2">
        <Calculator className="w-5 h-5 text-wiki-accent" />
        Build vs Buy
      </h2>
      <p className="text-sm text-wiki-text-muted mb-4">
        Should you build a {productName} alternative or buy the subscription? Estimate based on {featureCount} features.
      </p>

      {/* Inputs */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-wiki-text-muted mb-1">Team size</label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-wiki-border text-sm focus:outline-none focus:border-wiki-accent"
          >
            {[1, 5, 10, 25, 50, 100, 250].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-wiki-text-muted mb-1">Time horizon</label>
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-wiki-border text-sm focus:outline-none focus:border-wiki-accent"
          >
            {[1, 2, 3, 5].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'year' : 'years'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Buy */}
        <div className={`rounded-lg border-2 p-5 ${buyWins ? 'border-green-300 bg-green-50/50' : 'border-wiki-border bg-wiki-bg-alt'}`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-wiki-accent" />
            <h3 className="font-semibold text-wiki-text">Buy {productName}</h3>
            {buyWins && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Better Value</span>}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">Monthly cost</span>
              <span className="font-medium text-wiki-text">{lowestPaidPrice ? `$${buyMonthly.toLocaleString()}/mo` : 'Contact Sales'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">{years}-year total</span>
              <span className="font-bold text-wiki-text">{lowestPaidPrice ? `$${buyTotal.toLocaleString()}` : 'Varies'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">Time to deploy</span>
              <span className="font-medium text-wiki-text">Days</span>
            </div>
          </div>
        </div>

        {/* Build */}
        <div className={`rounded-lg border-2 p-5 ${!buyWins ? 'border-green-300 bg-green-50/50' : 'border-wiki-border bg-wiki-bg-alt'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-wiki-accent" />
            <h3 className="font-semibold text-wiki-text">Build Your Own</h3>
            {!buyWins && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Better Value</span>}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">Development cost</span>
              <span className="font-medium text-wiki-text">${build.devCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">Maintenance</span>
              <span className="font-medium text-wiki-text">${build.maintenanceMonthly.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">{years}-year total</span>
              <span className="font-bold text-wiki-text">${buildTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wiki-text-muted">Dev time</span>
              <span className="font-medium text-wiki-text">~{build.devMonths} months</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-4 rounded-lg bg-wiki-bg-alt border border-wiki-border">
        <p className="text-sm text-wiki-text-muted mb-2">
          {!buyWins
            ? `Building could save ~$${Math.abs(savings).toLocaleString()} over ${years} years.`
            : `Buying ${productName} saves ~$${Math.abs(savings).toLocaleString()} over ${years} years vs building.`
          }
        </p>
        <p className="text-xs text-wiki-text-muted">
          Estimates based on {featureCount} features and a BuildScore of {buildScore}/5. Actual costs vary.
        </p>
      </div>
    </section>
  );
}
