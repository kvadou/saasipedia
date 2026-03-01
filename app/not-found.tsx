import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-wiki-text mb-3">Page Not Found</h1>
      <p className="text-wiki-text-muted mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex justify-center mb-8">
        <SearchBar size="lg" placeholder="Search products, categories, features..." />
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/" className="wiki-link">
          Home
        </Link>
        <span className="text-wiki-text-muted">·</span>
        <Link href="/categories" className="wiki-link">
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
