import { v4 as uuidv4 } from 'uuid';
import type { PosterLayout } from '@/types/poster';
import type { DesignTemplateMetadata } from '@/types/rag';

// ─── Template metadata for RAG seeding ───────────────────────────
export const FITNESS_TEMPLATE_METADATA: DesignTemplateMetadata[] = [
  {
    headline_position: 'top-left',
    cta_position: 'bottom-left',
    font_pair: ['Bebas Neue', 'Montserrat'],
    palette: ['#0A0A0A', '#CC0000', '#FFFFFF'],
    spacing_style: 'compact',
    visual_density: 'high',
    background_type: 'gradient',
    composition_notes: 'Hero left layout. Large headline top-left, athlete image right side, CTA bottom-left. Aggressive diagonal line divides sections.',
    layer_order: ['background', 'diagonal-accent', 'headline', 'subheadline', 'cta'],
    design_rules: [
      'Headline in Bebas Neue at 96px+',
      'Red accent on key word in headline',
      'CTA button with sharp corners, red background',
      'Uppercase all text',
    ],
    example_prompt: 'Create an aggressive fitness poster for a gym promotion with dark red on black',
  },
  {
    headline_position: 'center',
    cta_position: 'bottom-center',
    font_pair: ['Orbitron', 'Space Grotesk'],
    palette: ['#050510', '#00D4FF', '#FFFFFF'],
    spacing_style: 'compact',
    visual_density: 'medium',
    background_type: 'gradient',
    composition_notes: 'Centered athletic layout. Radial glow behind headline. Tech/futuristic aesthetic for sports science or HIIT studio.',
    layer_order: ['background', 'glow-circle', 'headline', 'tagline', 'cta'],
    design_rules: [
      'Orbitron for all caps headline',
      'Electric blue glow effect on headline',
      'Centered composition with radial symmetry',
      'CTA with blue accent color',
    ],
    example_prompt: 'Futuristic HIIT class poster, electric blue, dark tech aesthetic',
  },
  {
    headline_position: 'bottom-left',
    cta_position: 'bottom-right',
    font_pair: ['Bebas Neue', 'Montserrat'],
    palette: ['#000000', '#FFD700', '#FFFFFF'],
    spacing_style: 'balanced',
    visual_density: 'medium',
    background_type: 'solid',
    composition_notes: 'Champion gold series. Image occupies upper 60%, text panel bottom 40%. Gold horizontal rule separates zones.',
    layer_order: ['background', 'image-zone', 'gold-bar', 'headline', 'subheadline', 'cta'],
    design_rules: [
      'Gold on black — premium championship feel',
      'Bottom-aligned text panel',
      'Horizontal gold divider line',
    ],
    example_prompt: 'Premium gym membership poster with gold and black championship theme',
  },
];

// ─── Starter layout: Dark Red Power ──────────────────────────────
export function createFitnessLayoutDarkRed(
  headline = 'LEVEL UP',
  subheadline = 'Your fitness journey starts today',
  cta = 'JOIN NOW'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'fitness',
    style: 'aggressive',
    palette: ['#0A0A0A', '#CC0000', '#FFFFFF', '#1A1A1A'],
    fonts: ['Bebas Neue', 'Montserrat'],
    layers: [
      // Background gradient
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'gradient',
        x: 0, y: 0,
        width: 1080, height: 1350,
        gradient: {
          type: 'linear',
          stops: [
            { color: '#000000', stop: 0 },
            { color: '#1A0000', stop: 0.6 },
            { color: '#0A0A0A', stop: 1 },
          ],
          angle: 135,
        },
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Red diagonal accent line
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: -20, y: 400,
        width: 1120, height: 6,
        rotation: -8,
        fill: '#CC0000',
        opacity: 0.7,
        name: 'Accent Line',
      } as import('@/types/poster').ShapeLayer,

      // Red vertical bar
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 60, y: 80,
        width: 8, height: 200,
        fill: '#CC0000',
        name: 'Vertical Accent',
      } as import('@/types/poster').ShapeLayer,

      // Main headline
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: headline.toUpperCase(),
        x: 80, y: 80,
        width: 900,
        fontFamily: 'Bebas Neue',
        fontSize: 120,
        fontWeight: '400',
        color: '#FFFFFF',
        align: 'left',
        letterSpacing: 4,
        lineHeight: 1.0,
        name: 'Headline',
      } as import('@/types/poster').TextLayer,

      // Subheadline
      {
        id: uuidv4(),
        type: 'text',
        role: 'subheadline',
        text: subheadline,
        x: 80, y: 340,
        width: 700,
        fontFamily: 'Montserrat',
        fontSize: 28,
        fontWeight: '600',
        color: '#CCCCCC',
        align: 'left',
        letterSpacing: 2,
        lineHeight: 1.3,
        name: 'Subheadline',
      } as import('@/types/poster').TextLayer,

      // Tagline label
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: 'TRANSFORM • ACHIEVE • DOMINATE',
        x: 80, y: 480,
        width: 920,
        fontFamily: 'Montserrat',
        fontSize: 18,
        fontWeight: '700',
        color: '#CC0000',
        align: 'left',
        letterSpacing: 4,
        name: 'Tagline',
      } as import('@/types/poster').TextLayer,

      // CTA background shape
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 1190,
        width: 300, height: 80,
        fill: '#CC0000',
        cornerRadius: 0,
        name: 'CTA Background',
      } as import('@/types/poster').ShapeLayer,

      // CTA text
      {
        id: uuidv4(),
        type: 'text',
        role: 'cta',
        text: cta.toUpperCase(),
        x: 80, y: 1205,
        width: 300,
        fontFamily: 'Bebas Neue',
        fontSize: 36,
        fontWeight: '400',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 3,
        name: 'CTA Text',
      } as import('@/types/poster').TextLayer,
    ],
  };
}

// ─── Starter layout: Electric Blue ───────────────────────────────
export function createFitnessLayoutElectric(
  headline = 'PUSH BEYOND',
  subheadline = 'High Intensity Training Program',
  cta = 'START FREE TRIAL'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'fitness',
    style: 'aggressive',
    palette: ['#050510', '#00D4FF', '#FFFFFF'],
    fonts: ['Orbitron', 'Space Grotesk'],
    layers: [
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'gradient',
        x: 0, y: 0,
        width: 1080, height: 1350,
        gradient: {
          type: 'radial',
          stops: [
            { color: '#0D1B3E', stop: 0 },
            { color: '#050510', stop: 1 },
          ],
          centerX: 0.5, centerY: 0.4,
          radius: 600,
        },
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Glow circle
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'circle',
        x: 540 - 200, y: 300,
        width: 400, height: 400,
        fill: '#00D4FF',
        opacity: 0.05,
        name: 'Glow',
      } as import('@/types/poster').ShapeLayer,

      // Headline
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: headline.toUpperCase(),
        x: 60, y: 120,
        width: 960,
        fontFamily: 'Orbitron',
        fontSize: 86,
        fontWeight: '800',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 6,
        lineHeight: 1.1,
        shadowColor: '#00D4FF',
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        name: 'Headline',
      } as import('@/types/poster').TextLayer,

      // Divider line
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 440, y: 340,
        width: 200, height: 2,
        fill: '#00D4FF',
        name: 'Divider',
      } as import('@/types/poster').ShapeLayer,

      // Subheadline
      {
        id: uuidv4(),
        type: 'text',
        role: 'subheadline',
        text: subheadline.toUpperCase(),
        x: 60, y: 360,
        width: 960,
        fontFamily: 'Space Grotesk',
        fontSize: 26,
        fontWeight: '500',
        color: '#00D4FF',
        align: 'center',
        letterSpacing: 5,
        name: 'Subheadline',
      } as import('@/types/poster').TextLayer,

      // CTA button bg
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 340, y: 1210,
        width: 400, height: 72,
        fill: '#00D4FF',
        cornerRadius: 4,
        name: 'CTA BG',
      } as import('@/types/poster').ShapeLayer,

      // CTA text
      {
        id: uuidv4(),
        type: 'text',
        role: 'cta',
        text: cta.toUpperCase(),
        x: 340, y: 1222,
        width: 400,
        fontFamily: 'Orbitron',
        fontSize: 24,
        fontWeight: '700',
        color: '#050510',
        align: 'center',
        letterSpacing: 2,
        name: 'CTA Text',
      } as import('@/types/poster').TextLayer,
    ],
  };
}
