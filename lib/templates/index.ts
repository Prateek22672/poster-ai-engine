import type { PosterCategory, PosterStyle } from '@/types/poster';
import type { DesignTemplateMetadata } from '@/types/rag';
import { FITNESS_TEMPLATE_METADATA } from './fitness';
import { SALE_TEMPLATE_METADATA } from './sale';
import { EVENT_TEMPLATE_METADATA } from './event';
import { REALESTATE_TEMPLATE_METADATA } from './realestate';

export * from './fitness';
export * from './sale';
export * from './event';
export * from './realestate';

// ─── Flat template list for RAG seeding ──────────────────────────
export interface TemplateRecord {
  template_id: string;
  industry: PosterCategory;
  style: PosterStyle;
  layout_type: string;
  metadata: DesignTemplateMetadata;
  embeddingText: string; // text sent to embedder
}

export const ALL_TEMPLATES: TemplateRecord[] = [
  ...FITNESS_TEMPLATE_METADATA.map((meta, i) => ({
    template_id: `fitness_${String(i + 1).padStart(3, '0')}`,
    industry: 'fitness' as PosterCategory,
    style: (meta.spacing_style === 'compact' ? 'aggressive' : 'elegant') as PosterStyle,
    layout_type: meta.headline_position,
    metadata: meta,
    embeddingText: [
      `fitness poster`,
      `style: ${meta.spacing_style}`,
      `fonts: ${meta.font_pair.join(', ')}`,
      `colors: ${meta.palette.join(', ')}`,
      `composition: ${meta.composition_notes}`,
      `rules: ${meta.design_rules.join('. ')}`,
      `example: ${meta.example_prompt}`,
    ].join('. '),
  })),

  ...SALE_TEMPLATE_METADATA.map((meta, i) => ({
    template_id: `sale_${String(i + 1).padStart(3, '0')}`,
    industry: 'sale' as PosterCategory,
    style: (meta.visual_density === 'high' ? 'aggressive' : 'luxury') as PosterStyle,
    layout_type: meta.headline_position,
    metadata: meta,
    embeddingText: [
      `sale discount poster`,
      `style: ${meta.spacing_style}`,
      `fonts: ${meta.font_pair.join(', ')}`,
      `colors: ${meta.palette.join(', ')}`,
      `composition: ${meta.composition_notes}`,
      `rules: ${meta.design_rules.join('. ')}`,
      `example: ${meta.example_prompt}`,
    ].join('. '),
  })),

  ...EVENT_TEMPLATE_METADATA.map((meta, i) => ({
    template_id: `event_${String(i + 1).padStart(3, '0')}`,
    industry: 'event' as PosterCategory,
    style: (meta.visual_density === 'low' ? 'elegant' : 'playful') as PosterStyle,
    layout_type: meta.headline_position,
    metadata: meta,
    embeddingText: [
      `event poster`,
      `style: ${meta.spacing_style}`,
      `fonts: ${meta.font_pair.join(', ')}`,
      `colors: ${meta.palette.join(', ')}`,
      `composition: ${meta.composition_notes}`,
      `rules: ${meta.design_rules.join('. ')}`,
      `example: ${meta.example_prompt}`,
    ].join('. '),
  })),

  ...REALESTATE_TEMPLATE_METADATA.map((meta, i) => ({
    template_id: `realestate_${String(i + 1).padStart(3, '0')}`,
    industry: 'realestate' as PosterCategory,
    style: (meta.visual_density === 'low'
      ? 'minimal'
      : meta.spacing_style === 'airy'
        ? 'luxury'
        : 'elegant') as PosterStyle,
    layout_type: meta.headline_position,
    metadata: meta,
    embeddingText: [
      `real estate property developer poster`,
      `style: ${meta.spacing_style}`,
      `fonts: ${meta.font_pair.join(', ')}`,
      `colors: ${meta.palette.join(', ')}`,
      `composition: ${meta.composition_notes}`,
      `rules: ${meta.design_rules.join('. ')}`,
      `example: ${meta.example_prompt}`,
    ].join('. '),
  })),
];
