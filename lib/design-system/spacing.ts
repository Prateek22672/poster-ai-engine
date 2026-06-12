import type { SpacingSystem } from '@/types/design';

export const SPACING_SYSTEMS: Record<string, SpacingSystem> = {
  compact: {
    id: 'compact',
    name: 'Compact',
    safeZone: 60,
    sectionGap: 40,
    elementGap: 16,
    ctaMarginBottom: 80,
    headlineMarginTop: 70,
    density: 'compact',
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    safeZone: 80,
    sectionGap: 60,
    elementGap: 24,
    ctaMarginBottom: 100,
    headlineMarginTop: 100,
    density: 'balanced',
  },
  airy: {
    id: 'airy',
    name: 'Airy',
    safeZone: 100,
    sectionGap: 80,
    elementGap: 32,
    ctaMarginBottom: 120,
    headlineMarginTop: 130,
    density: 'airy',
  },
};

// Standard poster dimensions (pixels)
export const POSTER_DIMENSIONS = {
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
} as const;

export const DEFAULT_DIMENSION = POSTER_DIMENSIONS['4:5'];

// Canvas grid constants
export const GRID = {
  columns: 12,
  columnWidth: 1080 / 12, // 90px per column
  gutter: 24,
};

// Safe area margins (per dimension)
export function getSafeArea(width: number, height: number, spacing: SpacingSystem) {
  return {
    top: spacing.headlineMarginTop,
    bottom: spacing.ctaMarginBottom,
    left: spacing.safeZone,
    right: spacing.safeZone,
    innerWidth: width - spacing.safeZone * 2,
    innerHeight: height - spacing.headlineMarginTop - spacing.ctaMarginBottom,
  };
}
