import type { ExtractedIntent } from '@/types/rag';
import type { PosterGenerationInput } from '@/types/poster';

/** All the text an archetype needs. Keep names SHORT — they become big headlines. */
export interface RealEstateContent {
  projectName: string;   // big serif name (e.g. "COVE", "Birla Arika") — kept short
  developer?: string;    // "BY IMTIAZ"
  location?: string;     // "DUBAILAND"
  tagline: string;       // "Modern Elegance"
  configLabel: string; configValue: string;   // "Residences" / "Studio, 1 & 2 BR"
  priceLabel: string; priceValue: string;     // "Starting From" / "AED 585K"
  detailLabel: string; detailValue: string;   // "Possession & Plan" / "Q1 2027 · 60/40"
  cta: string;           // "Enquire Now"
  brand?: string;        // agency, e.g. "REALTREE PROPERTIES"
  caption?: string;      // experiential mood line, e.g. "Chic Rooftop Moments"
  amenities?: string[];  // checklist items, e.g. ["Guest Room", "Swimming Pool"]
}

function firstMatch(text: string, re: RegExp, fallback = ''): string {
  const m = text.match(re);
  return m ? m[0].replace(/\s+/g, ' ').trim() : fallback;
}
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (ch) => ch.toUpperCase()).replace(/\b(Br|Bhk)\b/g, (m) => m.toUpperCase());
}
/** Keep a project name short: prefer an explicit headline; else the first 2-3 words. */
function shortName(raw: string): string {
  const words = raw.trim().split(/\s+/);
  let name = words.slice(0, 3).join(' ');
  if (name.length > 24) name = words.slice(0, 2).join(' ');
  return name.slice(0, 24);
}

export function extractRealEstateContent(
  input: PosterGenerationInput,
  intent: ExtractedIntent
): RealEstateContent {
  const prompt = input.prompt;

  const config = firstMatch(
    prompt,
    /(studio[\s,&\d-]*(?:&|to|,)?[\s\d-]*(?:br|bhk|bed(?:room)?s?))|(\d+(?:\s*[-&,]\s*\d+)?\s*(?:br|bhk|bed(?:room)?s?))/i,
    'Premium Residences'
  );
  const price = firstMatch(prompt, /(₹|aed|rs\.?|\$)\s?\d[\d.,]*\s?(cr(?:ore)?|lakhs?|k|m|million|onwards)?/i, 'Price on Request');
  const handover = firstMatch(prompt, /(q[1-4]\s*\d{4})|((?:handover|possession)[^.,\n]*\d{4})/i);
  const payment = firstMatch(prompt, /(\d{1,2}\s*\/\s*\d{1,2})\s*payment|(\d{1,2}%\s*(?:booking|down))/i);
  const detailValue = [handover, payment].filter(Boolean).join(' · ') || 'Enquire for details';
  const tagline = intent.secondaryText && intent.secondaryText.length <= 26 ? intent.secondaryText : 'Modern Elegance';

  // Project name: explicit headline wins; otherwise derive a SHORT name (never a sentence).
  const rawName = input.headline?.trim() || intent.primaryText || 'Your Project';
  const projectName = input.headline?.trim() ? input.headline.trim().slice(0, 26) : shortName(rawName);

  return {
    projectName,
    developer: input.brandText || undefined,
    location: undefined,
    tagline,
    configLabel: 'Residences',
    configValue: titleCase(config).slice(0, 38),
    priceLabel: 'Starting From',
    priceValue: price.toUpperCase().slice(0, 22),
    detailLabel: 'Possession & Plan',
    detailValue: titleCase(detailValue).slice(0, 38),
    cta: (input.ctaText || intent.ctaText || 'Enquire Now').slice(0, 20),
    brand: input.brandText || undefined,
  };
}
