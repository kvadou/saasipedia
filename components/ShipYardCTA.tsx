'use client';

import { useEffect, useState } from 'react';
import { Hammer, ArrowRight, Users, Wrench } from 'lucide-react';

interface Builder {
  display_name: string;
  status: string;
}

interface ShipYardCTAProps {
  productSlug: string;
  productName: string;
}

const statusColors: Record<string, string> = {
  shipped: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
};

function getStatusLabel(status: string): string {
  switch (status) {
    case 'shipped':
      return 'Shipped';
    case 'in_progress':
      return 'Building';
    case 'paused':
      return 'Paused';
    default:
      return status;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ShipYardCTA({ productSlug, productName }: ShipYardCTAProps) {
  const [count, setCount] = useState<number | null>(null);
  const [builders, setBuilders] = useState<Builder[]>([]);

  const shipyardUrl =
    process.env.NEXT_PUBLIC_SHIPYARD_URL || 'https://shipyard.reaplabs.ai';
  const reapUrl =
    process.env.NEXT_PUBLIC_REAP_URL || 'https://reaplabs.ai';

  useEffect(() => {
    fetch(`/api/shipyard/${productSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count ?? 0);
        setBuilders(data.recent_builders ?? []);
      })
      .catch(() => {
        setCount(0);
        setBuilders([]);
      });
  }, [productSlug]);

  // Don't render until data loads
  if (count === null) return null;

  return (
    <section id="shipyard" className="wiki-section scroll-mt-20">
      <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
            <Hammer className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {count > 0
                ? `${count} builder${count === 1 ? ' is' : 's are'} replacing ${productName} right now`
                : `Be the first to build your own ${productName}`}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {count > 0
                ? 'Join them on ShipYard — track your build, share progress, and stop paying.'
                : 'Start your build on ShipYard — track progress phase by phase with AI assistance.'}
            </p>
          </div>
        </div>

        {/* Recent builders */}
        {builders.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Users className="w-3.5 h-3.5" />
              Recent builders
            </div>
            <div className="flex flex-wrap gap-2">
              {builders.map((builder, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
                    {getInitials(builder.display_name)}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {builder.display_name}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[builder.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {getStatusLabel(builder.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`${shipyardUrl}/build?product=${productSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white
              font-medium text-sm hover:bg-sky-700 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Build Your Own
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={`${reapUrl}/?q=${encodeURIComponent(productName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300
              text-gray-700 font-medium text-sm hover:border-sky-400 hover:text-sky-600 transition-colors bg-white"
          >
            Analyze with Reap first
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
