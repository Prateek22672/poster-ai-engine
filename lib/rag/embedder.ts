import OpenAI from 'openai';
import { track, type CallUsage } from '@/lib/ai/cost';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a 1536-dim embedding vector for a given text.
 * Used for both seeding (template texts) and querying (user intent).
 */
export async function generateEmbedding(text: string, usage?: CallUsage[]): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // token safety
  });
  track(usage, 'rag-embed', 'text-embedding-3-small', response.usage?.prompt_tokens ?? 0, 0);
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in parallel (batched)
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  usage?: CallUsage[]
): Promise<number[][]> {
  // OpenAI supports batch input
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.slice(0, 8000)),
  });
  track(usage, 'seed-embed', 'text-embedding-3-small', response.usage?.prompt_tokens ?? 0, 0);
  // Sort by index to preserve order
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
