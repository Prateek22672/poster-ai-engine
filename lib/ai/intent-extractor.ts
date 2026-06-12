import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { track, type CallUsage } from '@/lib/ai/cost';
import type { ExtractedIntent } from '@/types/rag';
import type { PosterGenerationInput } from '@/types/poster';

const INTENT_SYSTEM_PROMPT = `You are a design intelligence system that extracts poster design intent from user prompts.

Return ONLY a valid JSON object with no markdown, no explanation. Strictly follow this schema:
{
  "category": "fitness" | "sale" | "event" | "realestate" | "restaurant",
  "style": "aggressive" | "minimal" | "elegant" | "playful" | "corporate" | "luxury",
  "tone": "energetic" | "professional" | "fun" | "luxury" | "urgent" | "calm",
  "colorPreference": "dark" | "light" | "vibrant" | "muted" | "monochrome",
  "targetAudience": string,
  "primaryText": string,
  "secondaryText": string,
  "ctaText": string,
  "keywords": string[],
  "suggestedFonts": string[],
  "suggestedColors": string[]
}

Rules:
- category MUST be one of: fitness, sale, event, realestate, restaurant
- realestate = property listings, open houses, agents, apartments/homes for sale or rent
- restaurant = cafes, dining, menus, food offers, happy hour, grand openings
- Extract or infer primaryText from the prompt (headline)
- Extract or infer secondaryText (subheadline/tagline)  
- Extract or infer ctaText (call to action button)
- suggestedFonts: pick 1-2 from [Switzer, Syne, Outfit, Oswald, Inter, Playfair Display, Cormorant Garamond, Bebas Neue, Montserrat, Space Grotesk, Poppins, Orbitron, Fira Code] — prefer premium picks (Switzer, Syne, Outfit, Oswald, Playfair Display) for upscale categories like realestate/restaurant
- suggestedColors: 2-3 hex colors based on the request
- keywords: 3-5 descriptive design keywords`;

export async function extractIntent(
  input: PosterGenerationInput,
  usage?: CallUsage[]
): Promise<ExtractedIntent> {
  const userMessage = buildIntentMessage(input);
  const provider = process.env.AI_PROVIDER ?? 'anthropic';

  try {
    if (provider === 'openai') {
      return await extractWithOpenAI(userMessage, usage);
    }
    return await extractWithAnthropic(userMessage);
  } catch (err) {
    console.error('[Intent] Extraction failed, using fallback:', err);
    return buildFallbackIntent(input);
  }
}

function buildIntentMessage(input: PosterGenerationInput): string {
  const parts = [`Prompt: "${input.prompt}"`];
  if (input.category) parts.push(`Category hint: ${input.category}`);
  if (input.style) parts.push(`Style hint: ${input.style}`);
  if (input.headline) parts.push(`Headline: "${input.headline}"`);
  if (input.subheadline) parts.push(`Subheadline: "${input.subheadline}"`);
  if (input.ctaText) parts.push(`CTA: "${input.ctaText}"`);
  if (input.colorPreference) parts.push(`Color preference: ${input.colorPreference}`);
  return parts.join('\n');
}

async function extractWithAnthropic(userMessage: string): Promise<ExtractedIntent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    system: INTENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return JSON.parse(text) as ExtractedIntent;
}

async function extractWithOpenAI(userMessage: string, usage?: CallUsage[]): Promise<ExtractedIntent> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: INTENT_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });
  track(usage, 'intent', 'gpt-4o-mini', response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0);
  return JSON.parse(response.choices[0].message.content ?? '{}') as ExtractedIntent;
}

function buildFallbackIntent(input: PosterGenerationInput): ExtractedIntent {
  const category = input.category ?? 'event';
  return {
    category,
    style: input.style ?? 'minimal',
    tone: 'professional',
    colorPreference: 'dark',
    targetAudience: 'general audience',
    primaryText: input.headline ?? 'YOUR HEADLINE',
    secondaryText: input.subheadline ?? 'Your tagline here',
    ctaText: input.ctaText ?? 'LEARN MORE',
    keywords: [category, 'professional', 'modern'],
    suggestedFonts: ['Montserrat', 'Space Grotesk'],
    suggestedColors: ['#1A1A2E', '#E94560', '#FFFFFF'],
  };
}
