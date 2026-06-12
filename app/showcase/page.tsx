'use client';

import { ClientsSection } from '@/components/marketing/ClientsSection';

export default function ShowcasePage() {
  return (
    <main className="min-h-dvh bg-[#080808]">
      <ClientsSection
        tagLabel="Trusted by 1,200+ teams"
        title="Loved by marketers, agencies & developers"
        highlight="agencies"
        description="From real-estate launches to restaurant openings, teams ship on-brand posters in seconds — at a fraction of the cost of a designer."
        stats={[
          { value: '1.2M+', label: 'Posters made' },
          { value: '60k', label: 'Per $1' },
          { value: '4.9/5', label: 'Avg rating' },
        ]}
        primaryActionLabel="Start creating"
        secondaryActionLabel="Book a demo"
        testimonials={[
          {
            name: 'Aarav Mehta',
            title: 'Marketing Lead, Birla Estates',
            rating: 5,
            quote:
              'We went from one designer per campaign to launching a full project poster set in an afternoon. The real-estate templates nail our brand.',
          },
          {
            name: 'Sofia Rossi',
            title: 'Owner, Saffron & Sage',
            rating: 5,
            quote:
              'Our menu and event posters finally look like a premium restaurant. I just type the offer and it’s done.',
          },
          {
            name: 'Daniel Cole',
            title: 'Founder, Launch Pad Realtors',
            rating: 4.5,
            quote:
              'The price, config and possession blocks auto-fill from the prompt. It feels like it was built for property marketing.',
          },
          {
            name: 'Priya Nair',
            title: 'Growth, RealTree Properties',
            rating: 5,
            quote:
              'Insights show the exact cost per poster — finance loves it. And the output is genuinely agency-grade.',
          },
        ]}
      />
    </main>
  );
}
