import OpenAI from 'openai';
import type { ReferenceImageAnalysis } from '@/types/rag';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeReferenceImage(
  imageBase64: string,
  mimeType: string
): Promise<ReferenceImageAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'low',
            },
          },
          {
            type: 'text',
            text: `Analyze this reference image for poster design. Reply ONLY with valid JSON, no markdown:
{
  "overallStyle": "one of: aggressive/minimal/elegant/playful/corporate/luxury",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "backgroundStyle": "dark/light/gradient/image",
  "typographyStyle": "bold/serif/sans/script/display",
  "composition": "centered/asymmetric/grid/diagonal/scattered",
  "mood": "one word mood",
  "designNotes": "one sentence describing key design elements to replicate"
}`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as ReferenceImageAnalysis;
  } catch {
    return {
      overallStyle: 'minimal',
      dominantColors: [],
      backgroundStyle: 'dark',
      typographyStyle: 'sans',
      composition: 'centered',
      mood: 'modern',
      designNotes: 'Could not parse reference image analysis.',
    };
  }
}
