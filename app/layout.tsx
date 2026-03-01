import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SaaSipedia — The Encyclopedia of Business Software',
    template: '%s | SaaSipedia',
  },
  description:
    'Explore detailed features, pricing, and integrations for hundreds of SaaS products. The free, open encyclopedia of business software.',
  openGraph: {
    title: 'SaaSipedia — The Encyclopedia of Business Software',
    description:
      'Explore detailed features, pricing, and integrations for hundreds of SaaS products.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-[calc(100vh-theme(spacing.14)-theme(spacing.32))]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
