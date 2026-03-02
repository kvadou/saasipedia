import { Hammer } from 'lucide-react';
import type { BuildScoreResult } from '@/lib/data';

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

interface BuildScoreProps {
  buildScore: BuildScoreResult;
}

export default function BuildScore({ buildScore }: BuildScoreProps) {
  const colors = colorMap[buildScore.color] || colorMap.amber;

  return (
    <div className="group relative inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
      >
        <Hammer className="w-3 h-3" />
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                i < buildScore.score ? colors.dot : 'bg-gray-200'
              }`}
            />
          ))}
        </span>
        {buildScore.label}
      </span>

      {/* Tooltip */}
      <div
        className="absolute left-0 top-full mt-1.5 z-50 w-56 px-3 py-2 rounded-lg border border-wiki-border
          bg-white shadow-md text-xs text-wiki-text-muted opacity-0 invisible
          group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none"
      >
        <p className="font-medium text-wiki-text mb-0.5">Build Difficulty: {buildScore.score}/5</p>
        <p>{buildScore.description}</p>
      </div>
    </div>
  );
}
