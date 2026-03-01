'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SearchBarProps {
  size?: 'sm' | 'lg';
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchBar({
  size = 'sm',
  defaultValue = '',
  placeholder = 'Search SaaS products...',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  const isLarge = size === 'lg';

  return (
    <form onSubmit={handleSubmit} className={isLarge ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-wiki-text-muted ${
            isLarge ? 'w-5 h-5' : 'w-4 h-4'
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-wiki-border rounded-lg bg-white text-wiki-text
            placeholder:text-wiki-text-muted focus:outline-none focus:ring-2 focus:ring-wiki-accent/30
            focus:border-wiki-accent transition-all ${
              isLarge
                ? 'pl-12 pr-4 py-3.5 text-lg'
                : 'pl-10 pr-3 py-2 text-sm'
            }`}
        />
      </div>
    </form>
  );
}
