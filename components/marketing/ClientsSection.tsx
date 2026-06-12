'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────
export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  name: string;
  title: string;
  quote?: string;
  avatarSrc?: string;
  rating: number;
}

export interface ClientsSectionProps {
  tagLabel: string;
  title: string;
  highlight?: string; // optional gradient-highlighted word in the title
  description: string;
  stats: Stat[];
  testimonials: Testimonial[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  className?: string;
}

// ─── Stat card ────────────────────────────────────────────────────
function StatCard({ value, label }: Stat) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-colors hover:border-white/20">
      <p className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/40">{label}</p>
    </div>
  );
}

// ─── Avatar with gradient ring + initials fallback ────────────────
function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="relative h-14 w-14 flex-shrink-0">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-60 blur-[2px]" />
      {src ? (
        <div
          className="relative h-14 w-14 rounded-2xl bg-cover bg-center ring-1 ring-white/15"
          style={{ backgroundImage: `url(${src})` }}
          aria-label={`Photo of ${name}`}
        />
      ) : (
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-sm font-bold text-white ring-1 ring-white/15">
          {initials}
        </div>
      )}
    </div>
  );
}

// ─── Sticky stacking testimonial card ─────────────────────────────
function StickyTestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <div className="sticky" style={{ top: `${96 + index * 22}px` }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'group relative overflow-hidden rounded-3xl p-6',
          'border border-white/10 bg-ink backdrop-blur-xl',
          'shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] transition-all duration-300',
          'hover:border-white/20'
        )}
      >
        {/* gradient hairline at the top */}
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        {/* ambient corner glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-600/10 blur-3xl transition-opacity duration-300 group-hover:bg-indigo-600/20" />

        <div className="relative flex items-center gap-4">
          <Avatar src={testimonial.avatarSrc} name={testimonial.name} />
          <div className="min-w-0 flex-grow">
            <p className="truncate text-base font-semibold text-white">{testimonial.name}</p>
            <p className="truncate text-sm text-white/40">{testimonial.title}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            <span className="text-sm font-bold text-white">{testimonial.rating.toFixed(1)}</span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="relative mt-4 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < Math.round(testimonial.rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-white/15'
              )}
            />
          ))}
        </div>

        {testimonial.quote && (
          <p className="relative mt-4 text-[15px] leading-relaxed text-white/60">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────
export function ClientsSection({
  tagLabel,
  title,
  highlight,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimary,
  onSecondary,
  className,
}: ClientsSectionProps) {
  const scrollHeight = `calc(100% + ${testimonials.length * 96}px)`;

  // Split the title so `highlight` renders with a gradient.
  const [before, after] = highlight && title.includes(highlight)
    ? title.split(highlight)
    : [title, ''];

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden bg-[#080808] py-24 text-white md:py-32',
        className
      )}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-700/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-700/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-start gap-16 px-6 lg:grid-cols-2 lg:gap-20">
        {/* Left: sticky pitch */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-white/60">{tagLabel}</span>
          </div>

          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {before}
            {after && (
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
            {after}
          </h2>

          <p className="max-w-md text-lg leading-relaxed text-white/50">{description}</p>

          <div className="mt-2 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onPrimary}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              {primaryActionLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onSecondary}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              {secondaryActionLabel}
            </button>
          </div>
        </div>

        {/* Right: stacking testimonials */}
        <div className="relative flex flex-col gap-4" style={{ height: scrollHeight }}>
          {testimonials.map((t, i) => (
            <StickyTestimonialCard key={t.name} index={i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientsSection;
