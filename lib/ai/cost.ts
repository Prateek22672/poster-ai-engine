/**
 * Per-call cost tracking — proves exactly what each generation costs.
 *
 * The token counts come DIRECTLY from OpenAI's API responses (`response.usage`),
 * the same numbers OpenAI bills from and shows at platform.openai.com/usage.
 * Cost = those real tokens × OpenAI's published per-token price below.
 *
 * If OpenAI changes prices, update PRICING (per 1,000,000 tokens).
 */
export const PRICING_PER_1M: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
};

export interface CallUsage {
  label: string; // call kind, e.g. "intent", "rag-embed", "layout", "image-search"
  provider: string; // "openai" | "pexels" | "cloudinary"
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  status: string; // "ok" | "error"
}

export function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING_PER_1M[model] ?? { input: 0, output: 0 };
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

/** Record a call into a usage sink and log it to the server console. */
export function track(
  sink: CallUsage[] | undefined,
  label: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  opts: { provider?: string; status?: string } = {}
): void {
  const costUsd = computeCost(model, inputTokens, outputTokens);
  const entry: CallUsage = {
    label,
    provider: opts.provider ?? 'openai',
    model,
    inputTokens,
    outputTokens,
    costUsd,
    status: opts.status ?? 'ok',
  };
  if (sink) sink.push(entry);
  console.log(
    `[Cost] ${entry.provider.padEnd(10)} ${label.padEnd(12)} ${(model || '-').padEnd(22)} in=${inputTokens} out=${outputTokens} -> $${costUsd.toFixed(6)}`
  );
}

/** Record a non-token call (e.g. Pexels image search) — counted, cost 0. */
export function trackEvent(
  sink: CallUsage[] | undefined,
  label: string,
  provider: string,
  status: string = 'ok'
): void {
  track(sink, label, '', 0, 0, { provider, status });
}

export function totalCost(sink: CallUsage[]): number {
  return sink.reduce((s, u) => s + u.costUsd, 0);
}
