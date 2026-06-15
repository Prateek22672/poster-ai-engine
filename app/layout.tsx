import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PosterAI — AI-Powered Design Engine',
  description: 'Generate professional marketing posters with AI-powered design intelligence. Not random image generation — structured composition, typography systems, and premium layouts.',
  keywords: ['poster', 'design', 'AI', 'marketing', 'Canva alternative', 'typography'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for dynamic font loading in canvas */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
