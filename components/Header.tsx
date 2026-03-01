import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-wiki-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-wiki-text hover:text-wiki-accent transition-colors shrink-0"
          >
            SaaSipedia
          </Link>

          <div className="flex-1 flex justify-center max-w-xl">
            <SearchBar size="sm" />
          </div>

          <nav className="flex items-center gap-5 text-sm shrink-0">
            <Link
              href="/categories"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-wiki-text-muted hover:text-wiki-text transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
