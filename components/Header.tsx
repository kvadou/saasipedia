'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-wiki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-wiki-accent hover:text-wiki-accent-hover transition-colors shrink-0"
          >
            SaaSipedia
          </Link>

          {/* Search — desktop */}
          <div className="hidden sm:flex flex-1 justify-center max-w-xl">
            <SearchBar size="sm" />
          </div>

          {/* Nav — desktop */}
          <nav className="hidden sm:flex items-center gap-5 text-sm shrink-0">
            <Link
              href="/#industries"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              Industries
            </Link>
            <Link
              href="/categories"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/features"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 -mr-2 text-wiki-text-muted hover:text-wiki-text transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="sm:hidden pb-4 border-t border-wiki-border pt-3">
            <div className="mb-3">
              <SearchBar size="sm" placeholder="Search products..." />
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/#industries"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors"
              >
                Industries
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/features"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
