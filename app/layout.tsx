import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Splash } from '@/components/ui/Splash';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = 'https://poster-ai-engine.foliofyx.in';
const DESCRIPTION =
  'PosterAI is a design engine — not random image generation. It composes professional marketing posters with structured layouts, real typography systems, and premium templates for real estate, restaurants, and more.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PosterAI — AI-Powered Design Engine',
    template: '%s · PosterAI',
  },
  description: DESCRIPTION,
  applicationName: 'PosterAI',
  keywords: ['poster maker', 'AI design', 'marketing posters', 'real estate posters', 'typography', 'Canva alternative', 'design engine'],
  authors: [{ name: 'PosterAI' }],
  creator: 'PosterAI',
  publisher: 'PosterAI',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'PosterAI',
    title: 'PosterAI — AI-Powered Design Engine',
    description: DESCRIPTION,
    locale: 'en_US',
    images: [{ url: '/posterai-logo.png', width: 891, height: 351, alt: 'PosterAI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PosterAI — AI-Powered Design Engine',
    description: DESCRIPTION,
    images: ['/posterai-logo.png'],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#1F2023',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect + Google Fonts (Host/Sansita/Space Grotesk) for the studio */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&family=Sansita+Swashed:wght@300..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-neutral-950 text-white antialiased">
        <Splash />
        {children}
      </body>
    </html>
  );
}
