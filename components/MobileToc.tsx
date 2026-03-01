'use client';

import { useState } from 'react';
import { List, ChevronDown } from 'lucide-react';

interface TocSection {
  id: string;
  label: string;
  indent?: boolean;
}

interface MobileTocProps {
  sections: TocSection[];
}

export default function MobileToc({ sections }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-wiki-border
          bg-wiki-bg-alt text-sm font-medium text-wiki-text hover:border-wiki-border-dark transition-colors"
      >
        <List className="w-4 h-4 text-wiki-text-muted" />
        On this page
        <ChevronDown className={`w-4 h-4 text-wiki-text-muted ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <nav className="mt-1 border border-wiki-border rounded-lg bg-white overflow-hidden">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 text-sm border-b border-wiki-border last:border-b-0
                text-wiki-text-muted hover:text-wiki-accent hover:bg-wiki-bg-alt transition-colors
                ${section.indent ? 'pl-8 text-xs' : ''}`}
            >
              {section.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
