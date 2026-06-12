import type { PosterCategory, PosterStyle } from './poster';

export interface DesignTemplateRecord {
  id: string;
  template_id: string;
  industry: PosterCategory;
  style: PosterStyle;
  layout_type: string;
  metadata: DesignTemplateMetadata;
  embedding?: number[];
  created_at: string;
}

export interface DesignTemplateMetadata {
  headline_position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center';
  cta_position: 'top' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  font_pair: [string, string];
  palette: string[];
  spacing_style: 'compact' | 'balanced' | 'airy';
  visual_density: 'low' | 'medium' | 'high';
  background_type: 'solid' | 'gradient' | 'image';
  composition_notes: string;
  layer_order: string[];
  design_rules: string[];
  example_prompt: string;
}

export interface RAGSearchResult {
  id: string;
  template_id: string;
  industry: PosterCategory;
  style: PosterStyle;
  layout_type: string;
  metadata: DesignTemplateMetadata;
  similarity: number;
}

export interface ReferenceImageAnalysis {
  overallStyle: string;
  dominantColors: string[];
  backgroundStyle: string;
  typographyStyle: string;
  composition: string;
  mood: string;
  designNotes: string;
}

export interface ExtractedIntent {
  category: PosterCategory;
  style: PosterStyle;
  tone: 'energetic' | 'professional' | 'fun' | 'luxury' | 'urgent' | 'calm';
  colorPreference: 'dark' | 'light' | 'vibrant' | 'muted' | 'monochrome';
  targetAudience: string;
  primaryText: string;
  secondaryText: string;
  ctaText: string;
  keywords: string[];
  suggestedFonts: string[];
  suggestedColors: string[];
}
