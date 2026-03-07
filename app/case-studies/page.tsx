import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Case Studies -- Custom Software Built with Reap',
  description: 'See real examples of custom software alternatives built with Reap. From CRM replacements to custom analytics dashboards.',
  alternates: { canonical: '/case-studies' },
};

const CASE_STUDIES = [
  {
    slug: 'custom-crm',
    title: 'Custom CRM for a Healthcare Network',
    category: 'CRM Software',
    replaces: 'HubSpot, Salesforce',
    summary: 'A HIPAA-compliant CRM built for a 50-location healthcare network. Replaced a $45k/year Salesforce subscription with a tailored system that integrated directly with their EHR.',
    savings: '$38k/year',
    buildTime: '6 weeks',
  },
  {
    slug: 'inventory-system',
    title: 'Real-Time Inventory Tracker for E-Commerce',
    category: 'Inventory Management',
    replaces: 'TradeGecko, Cin7',
    summary: 'A multi-warehouse inventory system for a DTC brand doing $12M/year. Real-time sync across Shopify, Amazon, and wholesale channels.',
    savings: '$22k/year',
    buildTime: '4 weeks',
  },
  {
    slug: 'project-dashboard',
    title: 'Project Dashboard for a Construction Firm',
    category: 'Project Management',
    replaces: 'Monday.com, Procore',
    summary: 'A field-friendly project tracker with photo documentation, daily logs, and subcontractor management. Built for crews who work on tablets.',
    savings: '$15k/year',
    buildTime: '5 weeks',
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-wiki-text-muted mb-6">
        <Link href="/" className="hover:text-wiki-accent transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-wiki-text">Case Studies</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-wiki-text mb-2">Case Studies</h1>
        <p className="text-wiki-text-muted max-w-2xl">
          Real examples of custom software built as alternatives to popular SaaS products. See what's possible when you build exactly what you need.
        </p>
      </div>

      <div className="space-y-6">
        {CASE_STUDIES.map((study) => (
          <div
            key={study.slug}
            className="rounded-lg border border-wiki-border p-6 hover:border-wiki-accent/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg font-semibold text-wiki-text mb-1">{study.title}</h2>
                <div className="flex items-center gap-2 text-xs text-wiki-text-muted">
                  <span className="px-2 py-0.5 rounded-full bg-wiki-bg-alt border border-wiki-border">{study.category}</span>
                  <span>Replaces: {study.replaces}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-wiki-text-muted mb-4 leading-relaxed">{study.summary}</p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-wiki-text-muted">Savings: </span>
                <span className="font-semibold text-green-600">{study.savings}</span>
              </div>
              <div>
                <span className="text-wiki-text-muted">Build time: </span>
                <span className="font-semibold text-wiki-text">{study.buildTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <h2 className="text-lg font-semibold text-wiki-text mb-2">Want a custom alternative?</h2>
        <p className="text-sm text-wiki-text-muted mb-4">
          Tell us what you're replacing and we'll scope it out for free.
        </p>
        <a
          href="https://reaplabs.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-wiki-accent text-white font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
        >
          Get Started with Reap
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
