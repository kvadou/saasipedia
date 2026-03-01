import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-wiki-border bg-wiki-bg-alt mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-wiki-text-muted">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="font-semibold text-wiki-text hover:text-wiki-accent transition-colors">
              SaaSipedia
            </Link>
            <Link href="/categories" className="hover:text-wiki-text transition-colors">Categories</Link>
            <Link href="/features" className="hover:text-wiki-text transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-wiki-text transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-wiki-text transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Data powered by{' '}
              <a
                href="https://reaplabs.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="wiki-link font-medium"
              >
                ReapLabs
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
