'use client';

import { Search, Layers, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  feature_count: number;
  quality_score: number;
}

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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isLarge = size === 'lg';

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(query.trim());
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function navigateTo(slug: string) {
    setIsOpen(false);
    router.push(`/wiki/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault();
          navigateTo(results[activeIndex].slug);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  function clearQuery() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapperRef} className={`relative ${isLarge ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-wiki-text-muted ${
              isLarge ? 'w-5 h-5' : 'w-4 h-4'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            className={`w-full border border-wiki-border rounded-lg bg-white text-wiki-text
              placeholder:text-wiki-text-muted focus:outline-none focus:ring-2 focus:ring-wiki-accent/30
              focus:border-wiki-accent transition-all ${
                isLarge
                  ? 'pl-12 pr-10 py-3.5 text-lg'
                  : 'pl-10 pr-8 py-2 text-sm'
              }`}
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className={`absolute top-1/2 -translate-y-1/2 text-wiki-text-muted hover:text-wiki-text transition-colors ${
                isLarge ? 'right-4' : 'right-3'
              }`}
            >
              <X className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full left-0 right-0 mt-1 bg-white border border-wiki-border
            rounded-lg shadow-lg overflow-hidden z-50 ${isLarge ? 'max-h-96' : 'max-h-80'}`}
        >
          {isLoading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-wiki-text-muted">Searching...</div>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-wiki-text-muted">
              No products found. Press Enter to search.
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={result.id}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => navigateTo(result.slug)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                index === activeIndex
                  ? 'bg-wiki-bg-alt'
                  : 'hover:bg-wiki-bg-alt'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-wiki-text ${isLarge ? 'text-base' : 'text-sm'}`}>
                    {result.name}
                  </span>
                  {result.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-wiki-indigo/10 text-wiki-indigo shrink-0">
                      {result.category}
                    </span>
                  )}
                </div>
                {result.tagline && (
                  <p className="text-xs text-wiki-text-muted line-clamp-1 mt-0.5">
                    {result.tagline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-wiki-text-muted shrink-0">
                <Layers className="w-3 h-3" />
                {result.feature_count}
              </div>
            </button>
          ))}

          {results.length > 0 && (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-wiki-accent hover:bg-wiki-bg-alt
                border-t border-wiki-border transition-colors font-medium"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
