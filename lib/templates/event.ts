import { v4 as uuidv4 } from 'uuid';
import type { PosterLayout } from '@/types/poster';
import type { DesignTemplateMetadata } from '@/types/rag';

export const EVENT_TEMPLATE_METADATA: DesignTemplateMetadata[] = [
  {
    headline_position: 'center',
    cta_position: 'bottom-center',
    font_pair: ['Playfair Display', 'Cormorant Garamond'],
    palette: ['#030014', '#8B5CF6', '#FFFFFF', '#C9A84C'],
    spacing_style: 'airy',
    visual_density: 'low',
    background_type: 'gradient',
    composition_notes: 'Midnight luxury gala. Purple gradient background, star/particle accents, centered event name, date prominent below, CTA bottom.',
    layer_order: ['background', 'star-accents', 'event-name', 'date-row', 'venue', 'cta'],
    design_rules: [
      'Event name in large serif at center',
      'Date/time as separate prominent row',
      'Venue in smaller caps below date',
      'Gold horizontal rules to separate sections',
    ],
    example_prompt: 'Luxury gala dinner invitation poster, dark purple with gold accents',
  },
  {
    headline_position: 'top-center',
    cta_position: 'bottom-center',
    font_pair: ['Space Grotesk', 'Poppins'],
    palette: ['#004E89', '#FF6B35', '#FFFFFF'],
    spacing_style: 'compact',
    visual_density: 'high',
    background_type: 'gradient',
    composition_notes: 'Festival poster with multiple speaker/act slots. Bold top headline, grid of performers, date/venue footer.',
    layer_order: ['background', 'headline', 'lineup', 'date-banner', 'cta'],
    design_rules: [
      'Festival name top in large display font',
      'Performer names in grid layout',
      'Date/venue in bottom banner',
      'Orange accent for headliners',
    ],
    example_prompt: 'Music festival poster with multiple artists, blue and orange vibrant',
  },
  {
    headline_position: 'top-left',
    cta_position: 'bottom-right',
    font_pair: ['Montserrat', 'Space Grotesk'],
    palette: ['#FFFFFF', '#E94560', '#1A1A2E'],
    spacing_style: 'airy',
    visual_density: 'low',
    background_type: 'solid',
    composition_notes: 'Minimal corporate event. Clean white background, dark navy text, single red accent. Sophisticated professional feel.',
    layer_order: ['background', 'event-type', 'headline', 'divider', 'details', 'cta'],
    design_rules: [
      'Minimal elements for premium corporate feel',
      'Red accent only on CTA and key dates',
      'Clean typographic hierarchy',
    ],
    example_prompt: 'Corporate conference poster, minimal white, professional business event',
  },
];

// ─── Gala layout ──────────────────────────────────────────────────
export function createEventLayoutGala(
  eventName = 'THE GRAND GALA',
  tagline = 'An Evening of Excellence',
  date = 'SATURDAY · DECEMBER 14, 2024',
  venue = 'The Ritz Carlton · New York',
  cta = 'Reserve Your Seat'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'event',
    style: 'elegant',
    palette: ['#030014', '#8B5CF6', '#C9A84C', '#FFFFFF'],
    fonts: ['Playfair Display', 'Cormorant Garamond'],
    layers: [
      // Deep dark gradient
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'gradient',
        x: 0, y: 0,
        width: 1080, height: 1350,
        gradient: {
          type: 'radial',
          stops: [
            { color: '#1A0F3E', stop: 0 },
            { color: '#030014', stop: 0.7 },
            { color: '#000000', stop: 1 },
          ],
          centerX: 0.5, centerY: 0.4,
          radius: 700,
        },
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Top gold rule
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 120,
        width: 920, height: 1,
        fill: '#C9A84C',
        name: 'Top Rule',
      } as import('@/types/poster').ShapeLayer,

      // Decorative gold diamond
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 534, y: 110,
        width: 12, height: 12,
        rotation: 45,
        fill: '#C9A84C',
        name: 'Diamond Accent',
      } as import('@/types/poster').ShapeLayer,

      // Event name
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: eventName,
        x: 80, y: 180,
        width: 920,
        fontFamily: 'Playfair Display',
        fontSize: 86,
        fontWeight: '700',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 4,
        lineHeight: 1.1,
        name: 'Event Name',
      } as import('@/types/poster').TextLayer,

      // Tagline
      {
        id: uuidv4(),
        type: 'text',
        role: 'subheadline',
        text: tagline,
        x: 80, y: 400,
        width: 920,
        fontFamily: 'Cormorant Garamond',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: '400',
        color: '#A78BFA',
        align: 'center',
        letterSpacing: 2,
        name: 'Tagline',
      } as import('@/types/poster').TextLayer,

      // Purple glow separator
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 340, y: 480,
        width: 400, height: 1,
        fill: '#8B5CF6',
        name: 'Purple Rule',
      } as import('@/types/poster').ShapeLayer,

      // Date
      {
        id: uuidv4(),
        type: 'text',
        role: 'date',
        text: date,
        x: 80, y: 520,
        width: 920,
        fontFamily: 'Cormorant Garamond',
        fontSize: 30,
        fontWeight: '600',
        color: '#C9A84C',
        align: 'center',
        letterSpacing: 4,
        name: 'Date',
      } as import('@/types/poster').TextLayer,

      // Venue
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: venue,
        x: 80, y: 580,
        width: 920,
        fontFamily: 'Cormorant Garamond',
        fontSize: 26,
        fontWeight: '400',
        color: '#AAAAAA',
        align: 'center',
        letterSpacing: 3,
        name: 'Venue',
      } as import('@/types/poster').TextLayer,

      // Bottom gold rule
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 1210,
        width: 920, height: 1,
        fill: '#C9A84C',
        name: 'Bottom Rule',
      } as import('@/types/poster').ShapeLayer,

      // CTA
      {
        id: uuidv4(),
        type: 'text',
        role: 'cta',
        text: cta.toUpperCase(),
        x: 80, y: 1240,
        width: 920,
        fontFamily: 'Cormorant Garamond',
        fontSize: 28,
        fontWeight: '600',
        color: '#C9A84C',
        align: 'center',
        letterSpacing: 8,
        name: 'CTA',
      } as import('@/types/poster').TextLayer,
    ],
  };
}

// ─── Festival layout ──────────────────────────────────────────────
export function createEventLayoutFestival(
  festivalName = 'SOUNDWAVE FESTIVAL',
  headliner = 'MAJOR ARTIST',
  acts = ['Artist Two', 'Artist Three', 'Artist Four', 'Artist Five'],
  date = 'JULY 20–22, 2025',
  venue = 'Central Park, New York',
  cta = 'GET TICKETS'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'event',
    style: 'playful',
    palette: ['#004E89', '#FF6B35', '#FFFFFF'],
    fonts: ['Space Grotesk', 'Poppins'],
    layers: [
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'gradient',
        x: 0, y: 0,
        width: 1080, height: 1350,
        gradient: {
          type: 'linear',
          stops: [
            { color: '#004E89', stop: 0 },
            { color: '#001F3F', stop: 1 },
          ],
          angle: 160,
        },
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Orange top stripe
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 0, y: 0,
        width: 1080, height: 8,
        fill: '#FF6B35',
        name: 'Top Stripe',
      } as import('@/types/poster').ShapeLayer,

      // Festival name
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: festivalName,
        x: 60, y: 60,
        width: 960,
        fontFamily: 'Space Grotesk',
        fontSize: 80,
        fontWeight: '700',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 6,
        name: 'Festival Name',
      } as import('@/types/poster').TextLayer,

      // Headliner
      {
        id: uuidv4(),
        type: 'text',
        role: 'subheadline',
        text: headliner,
        x: 60, y: 200,
        width: 960,
        fontFamily: 'Space Grotesk',
        fontSize: 52,
        fontWeight: '700',
        color: '#FF6B35',
        align: 'center',
        letterSpacing: 3,
        name: 'Headliner',
      } as import('@/types/poster').TextLayer,

      // Acts list
      ...acts.slice(0, 4).map((act, i) => ({
        id: uuidv4(),
        type: 'text' as const,
        role: 'body' as const,
        text: act.toUpperCase(),
        x: 60,
        y: 320 + i * 60,
        width: 960,
        fontFamily: 'Poppins',
        fontSize: 34,
        fontWeight: '500',
        color: '#CCDDEE',
        align: 'center' as const,
        letterSpacing: 4,
        name: `Act ${i + 1}`,
      }) as import('@/types/poster').TextLayer),

      // Orange divider
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 580,
        width: 920, height: 3,
        fill: '#FF6B35',
        name: 'Divider',
      } as import('@/types/poster').ShapeLayer,

      // Date
      {
        id: uuidv4(),
        type: 'text',
        role: 'date',
        text: date,
        x: 60, y: 610,
        width: 960,
        fontFamily: 'Space Grotesk',
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 3,
        name: 'Date',
      } as import('@/types/poster').TextLayer,

      // Venue
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: venue,
        x: 60, y: 670,
        width: 960,
        fontFamily: 'Poppins',
        fontSize: 26,
        fontWeight: '400',
        color: '#AABBCC',
        align: 'center',
        letterSpacing: 2,
        name: 'Venue',
      } as import('@/types/poster').TextLayer,

      // CTA background
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 280, y: 1200,
        width: 520, height: 80,
        fill: '#FF6B35',
        cornerRadius: 4,
        name: 'CTA BG',
      } as import('@/types/poster').ShapeLayer,

      // CTA text
      {
        id: uuidv4(),
        type: 'text',
        role: 'cta',
        text: cta,
        x: 280, y: 1218,
        width: 520,
        fontFamily: 'Space Grotesk',
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 3,
        name: 'CTA Text',
      } as import('@/types/poster').TextLayer,
    ],
  };
}
