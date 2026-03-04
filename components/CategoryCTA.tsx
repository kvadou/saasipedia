import { Hammer, ArrowRight, Wrench } from 'lucide-react';

interface CategoryCTAProps {
  categoryName: string;
  categorySlug: string;
  industryName: string;
  industrySlug: string;
}

export default function CategoryCTA({
  categoryName,
  categorySlug,
  industryName,
}: CategoryCTAProps) {
  const shipyardUrl =
    process.env.NEXT_PUBLIC_SHIPYARD_URL || 'https://shipyard.reaplabs.ai';
  const reapUrl =
    process.env.NEXT_PUBLIC_REAP_URL || 'https://reaplabs.ai';

  const buildRequestParams = new URLSearchParams({
    category: categoryName,
    industry: industryName,
  });

  return (
    <section className="mb-12 rounded-xl border border-wiki-border bg-gradient-to-br from-slate-50 to-blue-50 p-6 sm:p-8">
      <h3 className="text-xl font-bold text-wiki-text mb-2">
        Can&apos;t find the right fit?
      </h3>
      <p className="text-wiki-text-muted mb-6 max-w-2xl">
        Stop paying monthly fees for {categoryName.toLowerCase()} software that
        doesn&apos;t quite fit your {industryName.toLowerCase()} business.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Build Your Own */}
        <div className="rounded-lg border border-wiki-border bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-sky-100 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="font-semibold text-wiki-text">Build Your Own</h4>
          </div>
          <p className="text-sm text-wiki-text-muted mb-4">
            Track your build on ShipYard with AI guidance. Own your code from day one.
          </p>
          <a
            href={`${shipyardUrl}/build?category=${categorySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white
              text-sm font-medium hover:bg-sky-700 transition-colors"
          >
            Start Building
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Have It Built */}
        <div className="rounded-lg border border-wiki-accent/30 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
              <Hammer className="w-4 h-4 text-wiki-accent" />
            </div>
            <h4 className="font-semibold text-wiki-text">Have It Built For You</h4>
          </div>
          <p className="text-sm text-wiki-text-muted mb-4">
            Working prototype in 24–48 hours. You own the code. No monthly fees.
            From $1,500.
          </p>
          <a
            href={`${reapUrl}/build-request?${buildRequestParams.toString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-wiki-accent text-white
              text-sm font-medium hover:bg-wiki-accent-hover transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
