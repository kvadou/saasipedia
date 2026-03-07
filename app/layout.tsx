import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AskSaaSipedia from '@/components/AskSaaSipedia';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://saasipedia.com'),
  title: {
    default: 'SaaSipedia — The Encyclopedia of Business Software',
    template: '%s | SaaSipedia',
  },
  description:
    'The free encyclopedia of business software. Browse thousands of SaaS products with independently verified features, pricing, and integrations.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SaaSipedia — The Encyclopedia of Business Software',
    description:
      'The free encyclopedia of business software. Browse thousands of SaaS products with independently verified features, pricing, and integrations.',
    type: 'website',
    siteName: 'SaaSipedia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaSipedia — The Encyclopedia of Business Software',
    description:
      'The free encyclopedia of business software. Browse thousands of SaaS products with independently verified features, pricing, and integrations.',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SaaSipedia',
  url: 'https://saasipedia.com',
  description:
    'The free, open encyclopedia of business software. Explore features, pricing, and integrations for hundreds of SaaS products.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://saasipedia.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <Header />
        <main className="min-h-[calc(100vh-theme(spacing.14)-theme(spacing.32))]">
          {children}
        </main>
        <Footer />
        <AskSaaSipedia />
      </body>
    </html>
  );
}
