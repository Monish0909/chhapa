import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import { GlassNav } from '@/components/nav/GlassNav';
import { CartDrawer } from '@/components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Chhapa — Artisanal Handcrafted Textiles & Apparel',
  description:
    'Discover timeless hand-painted sustainable silhouettes and artisanal heritage crafts curated for modern everyday living.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream text-terracotta-dark antialiased min-h-screen selection:bg-terracotta-200">
        <SmoothScroll>
          <GlassNav />
          <CartDrawer />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
