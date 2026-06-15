import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { verifyEngineRequest, signEngineResponse } from '@/lib/security/engine-hmac';
import { selectRealEstateLayouts, type RealEstateContent } from '@/lib/templates/realestate';
import { renderLayoutToPng } from '@/lib/rendering/server-render';
import { uploadPosterToCloudinary } from '@/lib/cloudinary/upload';
import { checkDailyBudget, getClientIp } from '@/lib/security/guard';
import { isRealtorEnabled, logRealtorCall } from '@/lib/realtor/service';
import type { Layer, PosterLayout } from '@/types/poster';

export const maxDuration = 60;
const ENGINE_VERSION = process.env.ENGINE_VERSION ?? '1.0.0';
const W = 1080;

// ── helpers ──────────────────────────────────────────────────────
function pick(obj: Record<string, unknown> | undefined, ...keys: string[]): string {
  for (const k of keys) { const v = obj?.[k]; if (v != null && String(v).trim()) return String(v).trim(); }
  return '';
}
function toDataUrl(item: unknown, defaultMime: string): string | null {
  if (!item) return null;
  if (typeof item === 'string') return item.startsWith('data:') ? item : `data:${defaultMime};base64,${item}`;
  const o = item as { data?: string; mime?: string; base64?: string };
  const data = o.data ?? o.base64;
  if (!data) return null;
  return data.startsWith('data:') ? data : `data:${o.mime ?? defaultMime};base64,${data}`;
}
function buildContent(property: Record<string, unknown>, options: Record<string, unknown>): RealEstateContent {
  const developer = pick(property, 'developer', 'company', 'builder', 'brand');
  return {
    projectName: (pick(property, 'name', 'project_name', 'title', 'project') || 'Project').slice(0, 26),
    developer: developer || undefined,
    location: pick(property, 'location', 'city', 'area', 'sector') || undefined,
    tagline: pick(property, 'tagline', 'subtitle', 'headline') || 'Modern Elegance',
    configLabel: 'Residences',
    configValue: (pick(property, 'config', 'bhk', 'beds', 'type', 'configuration') || 'Premium Residences').slice(0, 38),
    priceLabel: 'Starting From',
    priceValue: (pick(property, 'price', 'starting_price', 'price_from') || 'Price on Request').slice(0, 22),
    detailLabel: 'Possession & Plan',
    detailValue: ([pick(property, 'possession', 'handover'), pick(property, 'payment_plan', 'payment')].filter(Boolean).join(' · ') || 'Enquire for details').slice(0, 38),
    cta: (pick(options, 'cta') || pick(property, 'cta') || 'Enquire Now').slice(0, 20),
    brand: developer || undefined,
  };
}
function logoLayer(src: string): Layer {
  return { id: uuidv4(), type: 'image', name: 'Company Logo', src, x: W - 256, y: 56, width: 200, height: 88, fit: 'contain' } as Layer;
}
function signed(obj: unknown, status: number, requestId?: string | null): NextResponse {
  const withId = typeof obj === 'object' && obj ? { request_id: requestId ?? null, ...obj } : obj;
  const body = JSON.stringify(withId);
  return new NextResponse(body, {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Signature': signEngineResponse(body) },
  });
}

// ── POST /api/posters/generate ───────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Raw body for HMAC (must verify against the exact bytes)
  const raw = await req.text();
  const auth = verifyEngineRequest(req.headers, raw);
  if (!auth.ok) {
    logRealtorCall({ status: 'unauthorized', error_code: auth.code, ip });
    const status = auth.code === 'ENGINE_NOT_CONFIGURED' ? 503 : 401;
    return signed({ status: 'error', error: { code: auth.code } }, status);
  }

  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch {
    logRealtorCall({ status: 'error', error_code: 'BAD_JSON', ip });
    return signed({ status: 'error', error: { code: 'BAD_JSON' } }, 400);
  }

  const requestId = (body.request_id as string) ?? null;
  const tenantId = (body.tenant_id as string) ?? 'default';
  const property = (body.property as Record<string, unknown>) ?? {};
  const options = (body.options as Record<string, unknown>) ?? {};
  const images = (body.images as unknown[]) ?? [];
  const logos = (body.logos as unknown[]) ?? [];

  // Kill-switch — if turned off in /admin, Realtor falls back to GD
  if (!(await isRealtorEnabled())) {
    logRealtorCall({ status: 'disabled', request_id: requestId, tenant_id: tenantId, ip });
    return signed({ status: 'error', error: { code: 'SERVICE_DISABLED' } }, 503, requestId);
  }

  if (!Array.isArray(images) || images.length < 1 || images.length > 6) {
    logRealtorCall({ status: 'error', error_code: 'INVALID_IMAGES', request_id: requestId, tenant_id: tenantId, images_count: Array.isArray(images) ? images.length : 0, ip });
    return signed({ status: 'error', error: { code: 'INVALID_IMAGES', message: '1–6 images required' } }, 400, requestId);
  }

  const budget = await checkDailyBudget();
  if (!budget.ok) {
    logRealtorCall({ status: 'error', error_code: 'BUDGET_REACHED', request_id: requestId, tenant_id: tenantId, ip });
    return signed({ status: 'error', error: { code: 'BUDGET_REACHED' } }, 429, requestId);
  }

  const t0 = Date.now();
  const logs: Array<{ step: string; ms: number; note?: string }> = [];
  try {
    const heroDataUrl = toDataUrl(images[0], 'image/jpeg');
    if (!heroDataUrl) return signed({ status: 'error', error: { code: 'INVALID_IMAGES', message: 'unreadable image' } }, 400, requestId);
    const logoDataUrl = toDataUrl(logos[0], 'image/png');
    logs.push({ step: 'input', ms: Date.now() - t0, note: `${images.length} photo(s), ${logos.length} logo(s)` });

    const content = buildContent(property, options);
    const count = Math.min(Math.max(Number(options.count) || 3, 1), 4);
    const designs = selectRealEstateLayouts(content, heroDataUrl, count);

    const posters: Array<Record<string, unknown>> = [];
    for (const d of designs) {
      const tR = Date.now();
      const layout: PosterLayout = logoDataUrl
        ? { ...d.layout, layers: [...d.layout.layers, logoLayer(logoDataUrl)] }
        : d.layout;
      const png = await renderLayoutToPng(layout);
      const up = await uploadPosterToCloudinary(`data:image/png;base64,${png.toString('base64')}`, `tenants/${tenantId}`);
      posters.push({
        cloudinary_url: up.url,
        public_id: up.publicId,
        width: up.width,
        height: up.height,
        format: 'png',
        layout: d.label,
        archetype: layout.id.split('-')[1] ?? 'default',
      });
      logs.push({ step: 'render+upload', ms: Date.now() - tR, note: d.label });
    }

    logRealtorCall({
      status: 'completed', request_id: requestId, tenant_id: tenantId,
      posters_count: posters.length, images_count: images.length, logos_count: logos.length,
      total_ms: Date.now() - t0,
      property: { name: content.projectName, developer: content.developer ?? null, price: content.priceValue, config: content.configValue },
      response: { posters: posters.map((p) => p.cloudinary_url), logs },
      ip,
    });
    return signed({
      status: 'completed',
      tenant_id: tenantId,
      posters,
      logs,
      cost_usd: 0, // real-estate is deterministic — no OpenAI cost
      engine_version: ENGINE_VERSION,
      total_ms: Date.now() - t0,
    }, 200, requestId);
  } catch (err) {
    console.error('[API/posters/generate] Error:', err);
    const message = err instanceof Error ? err.message : 'failed';
    logRealtorCall({ status: 'error', error_code: 'ENGINE_ERROR', request_id: requestId, tenant_id: tenantId, total_ms: Date.now() - t0, response: { error: message }, ip });
    return signed({ status: 'error', error: { code: 'ENGINE_ERROR', message } }, 500, requestId);
  }
}
