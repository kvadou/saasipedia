import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Case Studies — Custom Software Built by ReapLabs',
  description: 'Real projects built by ReapLabs as replacements for expensive SaaS subscriptions. Operations platforms, tutor portals, CRMs, marketplaces, and more.',
  alternates: { canonical: '/case-studies' },
};

const CASE_STUDIES = [
  {
    slug: 'opshub',
    title: 'OpsHub — Operations Platform for Story Time Chess',
    category: 'Operations Management',
    replaces: 'Salesforce + Monday.com + custom spreadsheets',
    summary: 'Built a unified operations platform for a multi-market education company. Sales pipeline, tutor scheduling, forecasting dashboards, and real-time KPIs — all in one system replacing 3 separate SaaS subscriptions and countless spreadsheets. Handles scheduling across NYC, LA, SF, and Nashville markets.',
    savings: '$52k/year',
    buildTime: '8 weeks',
    stack: 'React, Node.js, PostgreSQL',
  },
  {
    slug: 'storytimetutors',
    title: 'StoryTimeTutors — Tutor Portal with Gamification',
    category: 'Learning Management',
    replaces: 'Google Classroom + Trainual + custom PDFs',
    summary: 'A tutor-facing portal with curriculum delivery, training modules, onboarding checklists, and a gamification system with XP and achievements. Tutors access lesson plans, track certifications, and compete on leaderboards — all from a single branded portal.',
    savings: '$18k/year',
    buildTime: '6 weeks',
    stack: 'Next.js, TypeScript, Prisma, PostgreSQL',
  },
  {
    slug: 'franchise-crm',
    title: 'Franchise CRM — Prospect Pipeline for Franchise Sales',
    category: 'CRM Software',
    replaces: 'HubSpot + DocuSign',
    summary: 'A franchise prospect CRM with pipeline management, automated email sequences, document e-signing, and a public-facing prospect portal with an interactive franchise academy. Built for a team selling education franchise territories.',
    savings: '$28k/year',
    buildTime: '5 weeks',
    stack: 'Next.js, TypeScript, Prisma, Clerk Auth',
  },
  {
    slug: 'doughback',
    title: 'Doughback — Dining Cashback Marketplace',
    category: 'Marketplace Platform',
    replaces: 'Custom development from scratch',
    summary: 'A two-sided dining cashback marketplace connecting restaurants with deal-seeking diners. Receipt-based OCR verification, Stripe Connect payments, Mapbox restaurant discovery, and a merchant dashboard. From concept to production in weeks, not months.',
    savings: 'Built for <$5k vs $150k+ agency quote',
    buildTime: '4 weeks',
    stack: 'Next.js, Supabase, Stripe Connect, Mapbox',
  },
  {
    slug: 'saasipedia',
    title: 'SaaSipedia — The Encyclopedia of Business Software',
    category: 'Content Platform',
    replaces: 'WordPress + Airtable + manual research',
    summary: 'An automated encyclopedia of SaaS products with AI-powered data extraction, quality scoring, and comparison tools. 600+ products cataloged with features, pricing, and integrations — all independently verified. SEO-optimized with structured data, glossary, and industry filtering.',
    savings: '90% less manual research time',
    buildTime: '3 weeks',
    stack: 'Next.js, TypeScript, Supabase, Anthropic AI',
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-wiki-text-muted">Savings: </span>
                <span className="font-semibold text-green-600">{study.savings}</span>
              </div>
              <div>
                <span className="text-wiki-text-muted">Build time: </span>
                <span className="font-semibold text-wiki-text">{study.buildTime}</span>
              </div>
              <div>
                <span className="text-wiki-text-muted">Stack: </span>
                <span className="font-medium text-wiki-text">{study.stack}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center">
        <h2 className="text-lg font-semibold text-wiki-text mb-2">Stop overpaying for software you've outgrown</h2>
        <p className="text-sm text-wiki-text-muted mb-4">
          ReapLabs builds custom software that replaces expensive SaaS subscriptions. Tell us what you're paying for and we'll show you a better way.
        </p>
        <a
          href="https://reaplabs.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-wiki-accent text-white font-medium text-sm hover:bg-wiki-accent-hover transition-colors"
        >
          Get Started with ReapLabs
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
