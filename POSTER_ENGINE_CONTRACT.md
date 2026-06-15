# Poster Engine — API Contract (engine side)

This is what the **Poster Engine** (this Next.js app) exposes for the Realtor
(CodeIgniter) integration. It matches your `POSTER_ENGINE_INTEGRATION.md` §4/§5.
Server-to-server only — the engine never talks to the browser.

Base URL: `https://<engine-domain>`  (e.g. your Vercel/VPS URL → `POSTER_ENGINE_URL`)

================================================================================
## 1. Endpoints
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET  | `/api/health`           | none | Liveness — fail fast / fall back to GD |
| POST | `/api/posters/generate` | HMAC | Generate N posters → Cloudinary URLs |

================================================================================
## 2. Auth (HMAC — both directions)
Shared secrets, identical on both sides (already generated):
```
POSTER_ENGINE_API_KEY      = pe_...          (X-Api-Key)
POSTER_ENGINE_HMAC_SECRET  = <64 hex>        (signing secret)
```
**Request headers:**
```
X-Api-Key:    <POSTER_ENGINE_API_KEY>
X-Timestamp:  <unix seconds>                       # must be within ±300s
X-Signature:  hmac_sha256(SECRET, `${ts}.${sha256(rawBody)}`)
Content-Type: application/json
```
Verification order (constant-time, against the raw body bytes):
`api key` → `timestamp window` → `signature`. Failures → `401`
(`UNAUTHORIZED` / `STALE_TIMESTAMP` / `BAD_SIGNATURE`).

**Response:** the engine signs the body — header `X-Signature = hmac_sha256(SECRET, sha256(body))`.
Verify it before trusting the response.

PHP signing (matches the engine):
```php
$ts   = (string) time();
$sig  = hash_hmac('sha256', $ts.'.'.hash('sha256', $body), POSTER_ENGINE_HMAC_SECRET);
```

================================================================================
## 3. POST /api/posters/generate — request
```json
{
  "request_id": "req_abc123",          // echoed back (correlate logs)
  "tenant_id":  "tenant_42",           // echoed back; Cloudinary folder = tenants/<id>
  "property": {
    "name":        "AZURE HEIGHTS",     // → big headline (kept short)
    "developer":   "Birla",             // → brand mark / "BY ..."
    "location":    "Sector 31",
    "price":       "₹12 CR onwards",
    "config":      "3 & 4 BHK",         // beds / type / configuration
    "possession":  "Q4 2027",
    "payment_plan":"60/40",
    "tagline":     "Modern Elegance",   // optional
    "cta":         "Enquire Now"        // optional
  },
  "options": {
    "category": "realestate",           // default realestate
    "count":    3,                      // 1–4 distinct layouts to return
    "style":    "luxury"                // optional hint
  },
  "images": [                           // 1–6 agent photos (base64). images[0] = hero background
    { "data": "<base64>", "mime": "image/jpeg" }
  ],
  "logos":  [                           // optional; logos[0] composited top-right
    { "data": "<base64>", "mime": "image/png" }
  ]
}
```
Notes:
- `images[]` may be `{data,mime}` objects **or** plain base64 strings (with/without `data:` prefix).
- The engine resizes/cover-fits photos itself. Send ≤2048px to keep the payload small.
- Property fields are flexible — common aliases accepted (`project_name`, `bhk`, `company`, `handover`, …).

================================================================================
## 4. Response — success (200)
```json
{
  "request_id": "req_abc123",
  "status": "completed",
  "tenant_id": "tenant_42",
  "posters": [
    { "cloudinary_url": "https://res.cloudinary.com/.../poster.png",
      "public_id": "tenants/tenant_42/abc",
      "width": 1080, "height": 1350, "format": "png",
      "layout": "Top Band", "archetype": "topband" }
  ],
  "logs": [ { "step": "input", "ms": 3, "note": "1 photo(s), 1 logo(s)" },
            { "step": "render+upload", "ms": 820, "note": "Top Band" } ],
  "cost_usd": 0,
  "engine_version": "1.0.0",
  "total_ms": 1840
}
```
`cost_usd` is **0** for real-estate (deterministic layout — no OpenAI call).

## 5. Response — error (4xx/5xx)
```json
{ "request_id": "req_abc123", "status": "error",
  "error": { "code": "BAD_SIGNATURE" } }
```
Codes: `ENGINE_NOT_CONFIGURED`(503), `UNAUTHORIZED`/`STALE_TIMESTAMP`/`BAD_SIGNATURE`(401),
`BAD_JSON`/`INVALID_IMAGES`(400), `BUDGET_REACHED`(429), `ENGINE_ERROR`(500).
On **any** error/timeout, the Realtor falls back to GD — the feature never hard-fails.

================================================================================
## 6. GET /api/health
```json
{ "status": "ok", "service": "poster-engine", "version": "1.0.0", "time": 1781500000 }
```

================================================================================
## 7. Engine env (Vercel / host)
```
POSTER_ENGINE_API_KEY        # same as Realtor
POSTER_ENGINE_HMAC_SECRET    # same as Realtor
ENGINE_VERSION=1.0.0
OPENAI_API_KEY               # (only used by non-realestate categories)
NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
DAILY_BUDGET_USD, RATE_LIMIT_PER_MIN
```
`vercel.json` / route `maxDuration` = 60s (covers a 1–4 poster synchronous render).

================================================================================
## 8. Sync timing
Real-estate generation is **deterministic** (no Vision/LLM at request time): render +
Cloudinary upload of 3 posters ≈ a few seconds — comfortably inside the 45s sync window.
(Other categories use OpenAI and cost more — real-estate is the integrated path.)
