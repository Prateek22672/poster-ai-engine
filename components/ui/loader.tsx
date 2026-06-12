'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Animated SVG path loader ─────────────────────────────────────
interface LoaderProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

export const Loader = React.forwardRef<SVGSVGElement, LoaderProps>(
  ({ className, size = 64, strokeWidth = 2, ...props }, ref) => {
    const pathRef = React.useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = React.useState(0);

    React.useEffect(() => {
      if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
    }, []);

    const ready = pathLength > 0;
    return (
      <svg
        ref={ref}
        role="status"
        aria-label="Loading"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        className={cn('text-current', className)}
        {...props}
      >
        <path
          ref={pathRef}
          d="M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={
            ready
              ? ({ strokeDasharray: pathLength, '--path-length': pathLength } as React.CSSProperties)
              : undefined
          }
          className={cn(
            'transition-opacity duration-300',
            ready ? 'opacity-100 animate-[drawStroke_2.5s_infinite]' : 'opacity-0'
          )}
        />
      </svg>
    );
  }
);
Loader.displayName = 'Loader';

// ─── Loader + shimmer text ────────────────────────────────────────
export function LoadingText({
  text = 'Generating',
  size = 20,
  className,
}: {
  text?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5 text-[15px] font-medium tracking-wide', className)}>
      <Loader size={size} strokeWidth={2.5} className="text-indigo-400" />
      <span className="shimmer-text">{text}</span>
    </div>
  );
}

// ─── Three-dot inline spinner (for small inline loads) ────────────
export function DotsLoading({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className={cn('text-current', className)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate id="d0" begin="0;d2.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate begin="d0.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate id="d2" begin="d0.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33" />
      </circle>
    </svg>
  );
}
