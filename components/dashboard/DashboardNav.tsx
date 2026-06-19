'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutGrid, ShieldCheck, Layers, BarChart3, Eye } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/create', label: 'Create', icon: Sparkles },
  { href: '/gallery', label: 'Gallery', icon: LayoutGrid },
  { href: '/studio', label: 'Studio', icon: Eye },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
];

// Dark frosted pill — reads on BOTH the bright sunset bg and the dark editor.
const PILL =
  'bg-ink backdrop-blur-xl border border-white/15 ' +
  'shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_6px_20px_rgba(0,0,0,0.35)]';

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-5 pt-3 pb-2 pointer-events-none">
      {/* Logo pill */}
      <Link
        href="/create"
        className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-150 hover:bg-ink ${PILL}`}
      >
        <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
          <Layers className="w-3 h-3 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-white tracking-tight leading-none">PosterAI</span>
      </Link>

      {/* Center nav pill */}
      <nav className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-1 rounded-full ${PILL}`}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-white/15 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset]'
                  : 'text-white/55 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right pill — Admin */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <Link
          href="/admin"
          title="Open admin panel"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-white/70 hover:text-white transition-colors hover:bg-ink ${PILL}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </div>
  );
}
