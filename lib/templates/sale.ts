import { v4 as uuidv4 } from 'uuid';
import type { PosterLayout } from '@/types/poster';
import type { DesignTemplateMetadata } from '@/types/rag';

export const SALE_TEMPLATE_METADATA: DesignTemplateMetadata[] = [
  {
    headline_position: 'top-center',
    cta_position: 'bottom-center',
    font_pair: ['Montserrat', 'Poppins'],
    palette: ['#FFFFFF', '#FF1744', '#1A1A1A'],
    spacing_style: 'compact',
    visual_density: 'high',
    background_type: 'solid',
    composition_notes: 'Big bold discount percentage as hero. White background with red accents for urgency. Price callout in center. Timer-style layout.',
    layer_order: ['background', 'badge', 'discount-pct', 'product-name', 'price', 'cta'],
    design_rules: [
      'Discount % in massive font (200px+)',
      'OFF label beside percentage',
      'Original price with strikethrough',
      'New price in red',
    ],
    example_prompt: 'Flash sale poster 50% off summer collection, urgent red and white',
  },
  {
    headline_position: 'top-left',
    cta_position: 'bottom-right',
    font_pair: ['Playfair Display', 'Cormorant Garamond'],
    palette: ['#0D0D0D', '#C9A84C', '#FFFFFF'],
    spacing_style: 'airy',
    visual_density: 'low',
    background_type: 'solid',
    composition_notes: 'Premium black + gold. Collection name top-left, exclusive offer centered, CTA bottom-right. Understated elegance.',
    layer_order: ['background', 'gold-line', 'collection-name', 'offer-text', 'cta'],
    design_rules: [
      'Avoid aggressive sale language',
      'Use "Exclusive Offer" not "SALE"',
      'Gold thin horizontal rules as dividers',
    ],
    example_prompt: 'Luxury brand exclusive offer poster, black gold, premium feel',
  },
];

// ─── Hot Sale layout ──────────────────────────────────────────────
export function createSaleLayoutHot(
  discount = '50%',
  productName = 'Summer Collection',
  originalPrice = '$199',
  salePrice = '$99',
  cta = 'SHOP NOW'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'sale',
    style: 'aggressive',
    palette: ['#FFFFFF', '#FF1744', '#1A1A1A'],
    fonts: ['Montserrat', 'Poppins'],
    layers: [
      // White background
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'solid',
        x: 0, y: 0,
        width: 1080, height: 1350,
        color: '#FFFFFF',
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Red top banner
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 0, y: 0,
        width: 1080, height: 160,
        fill: '#FF1744',
        name: 'Top Banner',
      } as import('@/types/poster').ShapeLayer,

      // FLASH SALE label
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: '⚡ FLASH SALE ⚡',
        x: 0, y: 50,
        width: 1080,
        fontFamily: 'Montserrat',
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 6,
        name: 'Sale Label',
      } as import('@/types/poster').TextLayer,

      // Huge discount percentage
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: discount,
        x: 60, y: 200,
        width: 700,
        fontFamily: 'Montserrat',
        fontSize: 280,
        fontWeight: '900',
        color: '#FF1744',
        align: 'left',
        letterSpacing: -5,
        lineHeight: 0.9,
        name: 'Discount %',
      } as import('@/types/poster').TextLayer,

      // OFF text
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: 'OFF',
        x: 780, y: 350,
        width: 240,
        fontFamily: 'Montserrat',
        fontSize: 80,
        fontWeight: '900',
        color: '#1A1A1A',
        align: 'left',
        letterSpacing: 2,
        name: 'OFF Label',
      } as import('@/types/poster').TextLayer,

      // Red accent line
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 60, y: 640,
        width: 960, height: 4,
        fill: '#FF1744',
        name: 'Divider',
      } as import('@/types/poster').ShapeLayer,

      // Product name
      {
        id: uuidv4(),
        type: 'text',
        role: 'subheadline',
        text: productName.toUpperCase(),
        x: 60, y: 670,
        width: 960,
        fontFamily: 'Montserrat',
        fontSize: 44,
        fontWeight: '700',
        color: '#1A1A1A',
        align: 'center',
        letterSpacing: 6,
        name: 'Product Name',
      } as import('@/types/poster').TextLayer,

      // Original price (struck through)
      {
        id: uuidv4(),
        type: 'text',
        role: 'price',
        text: originalPrice,
        x: 60, y: 780,
        width: 960,
        fontFamily: 'Poppins',
        fontSize: 42,
        fontWeight: '400',
        color: '#AAAAAA',
        align: 'center',
        textDecoration: 'line-through',
        name: 'Original Price',
      } as import('@/types/poster').TextLayer,

      // Sale price
      {
        id: uuidv4(),
        type: 'text',
        role: 'price',
        text: salePrice,
        x: 60, y: 850,
        width: 960,
        fontFamily: 'Montserrat',
        fontSize: 100,
        fontWeight: '900',
        color: '#FF1744',
        align: 'center',
        letterSpacing: -2,
        name: 'Sale Price',
      } as import('@/types/poster').TextLayer,

      // CTA BG
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 200, y: 1190,
        width: 680, height: 90,
        fill: '#1A1A1A',
        cornerRadius: 0,
        name: 'CTA BG',
      } as import('@/types/poster').ShapeLayer,

      // CTA text
      {
        id: uuidv4(),
        type: 'text',
        role: 'cta',
        text: cta,
        x: 200, y: 1208,
        width: 680,
        fontFamily: 'Montserrat',
        fontSize: 38,
        fontWeight: '800',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 4,
        name: 'CTA Text',
      } as import('@/types/poster').TextLayer,

      // Bottom urgency text
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: 'LIMITED TIME OFFER • ENDS MIDNIGHT',
        x: 60, y: 1300,
        width: 960,
        fontFamily: 'Poppins',
        fontSize: 20,
        fontWeight: '500',
        color: '#999999',
        align: 'center',
        letterSpacing: 3,
        name: 'Urgency Text',
      } as import('@/types/poster').TextLayer,
    ],
  };
}

// ─── Luxury Sale layout ───────────────────────────────────────────
export function createSaleLayoutLuxury(
  collection = 'Exclusive Collection',
  offer = 'Private Sale',
  discount = '30% Off',
  cta = 'View Collection'
): PosterLayout {
  return {
    id: uuidv4(),
    version: '1.0',
    dimensions: { width: 1080, height: 1350 },
    category: 'sale',
    style: 'luxury',
    palette: ['#0D0D0D', '#C9A84C', '#FFFFFF'],
    fonts: ['Playfair Display', 'Cormorant Garamond'],
    layers: [
      {
        id: uuidv4(),
        type: 'background',
        fillType: 'solid',
        x: 0, y: 0,
        width: 1080, height: 1350,
        color: '#0D0D0D',
        name: 'Background',
      } as import('@/types/poster').BackgroundLayer,

      // Top gold line
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 100,
        width: 920, height: 1,
        fill: '#C9A84C',
        name: 'Top Rule',
      } as import('@/types/poster').ShapeLayer,

      // Collection label
      {
        id: uuidv4(),
        type: 'text',
        role: 'label',
        text: collection.toUpperCase(),
        x: 80, y: 130,
        width: 920,
        fontFamily: 'Cormorant Garamond',
        fontSize: 24,
        fontWeight: '400',
        color: '#C9A84C',
        align: 'center',
        letterSpacing: 8,
        name: 'Collection',
      } as import('@/types/poster').TextLayer,

      // Main headline
      {
        id: uuidv4(),
        type: 'text',
        role: 'headline',
        text: offer,
        x: 80, y: 220,
        width: 920,
        fontFamily: 'Playfair Display',
        fontSize: 96,
        fontWeight: '700',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 2,
        lineHeight: 1.1,
        name: 'Offer Headline',
      } as import('@/types/poster').TextLayer,

      // Gold divider
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 380, y: 440,
        width: 320, height: 1,
        fill: '#C9A84C',
        name: 'Middle Rule',
      } as import('@/types/poster').ShapeLayer,

      // Discount
      {
        id: uuidv4(),
        type: 'text',
        role: 'price',
        text: discount,
        x: 80, y: 480,
        width: 920,
        fontFamily: 'Playfair Display',
        fontSize: 72,
        fontWeight: '400',
        fontStyle: 'italic',
        color: '#C9A84C',
        align: 'center',
        letterSpacing: 2,
        name: 'Discount',
      } as import('@/types/poster').TextLayer,

      // Bottom gold line
      {
        id: uuidv4(),
        type: 'shape',
        shapeType: 'rect',
        x: 80, y: 1220,
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
        fontWeight: '400',
        color: '#C9A84C',
        align: 'center',
        letterSpacing: 8,
        name: 'CTA',
      } as import('@/types/poster').TextLayer,
    ],
  };
}
