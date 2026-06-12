# PosterAI — Integration Handoff (for the PHP / cPanel team)

Connect your existing PHP app to the PosterAI design engine. Your app calls one
secure HTTPS endpoint, server-to-server, and gets back a ready poster image URL.
**You never hold our AI keys** — only your own service key.

--------------------------------------------------------------------------------
## What you receive from us
1. **Endpoint:** `https://engine.<our-domain>/api/v1/generate`
2. **Service key:** `sk_live_...` (your Bearer token — keep it server-side only)
3. This document.

## What we need from you
- Confirm your server can make **outbound HTTPS POST** (PHP cURL / Guzzle). (Standard.)
- Your server's **public outbound IP(s)** — we can lock the key to your IP, so a
  leaked key can't be used from anywhere else. (Optional but recommended.)
- Where you'll store the returned `image_url` (your MySQL) and display/publish it.

--------------------------------------------------------------------------------
## The API

`POST /api/v1/generate`
Headers:
```
Authorization: Bearer sk_live_...
Content-Type: application/json
```
Body:
```json
{
  "prompt":      "Luxury 3 BHK, AED 1.2M, Q4 2027, Downtown",
  "category":    "realestate",
  "headline":    "AZURE",                 // short project name (becomes the big title)
  "brandText":   "Emaar",                 // developer / company
  "ctaText":     "Enquire Now",
  "heroImageUrl":"https://.../your-photo.jpg"   // OPTIONAL — your own property photo; omit to auto-source
}
```
Success response:
```json
{
  "status":    "completed",
  "image_url": "https://res.cloudinary.com/.../poster.png",
  "poster_id": "….",
  "archetype": "cove",
  "width": 1080, "height": 1350,
  "cost_usd": 0
}
```
Error responses (HTTP 4xx/5xx):
```json
{ "status": "error", "error": "Invalid or missing API key" }   // 401
{ "status": "error", "error": "Rate limit exceeded" }          // 429
{ "status": "error", "error": "Daily limit reached" }          // 429
{ "status": "error", "error": "Prompt is required" }           // 400
```

--------------------------------------------------------------------------------
## Test it FIRST (before touching PHP)
Run this from any terminal — if you get back an `image_url`, you're connected:
```bash
curl -X POST https://engine.<our-domain>/api/v1/generate \
  -H "Authorization: Bearer sk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Luxury 3 BHK, AED 1.2M, Q4 2027","category":"realestate","headline":"AZURE","brandText":"Emaar"}'
```

--------------------------------------------------------------------------------
## Wire it into `generate.php`
```php
<?php
$ch = curl_init('https://engine.<our-domain>/api/v1/generate');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST          => true,
  CURLOPT_HTTPHEADER    => [
    'Content-Type: application/json',
    'Authorization: Bearer ' . getenv('POSTER_ENGINE_KEY'),  // store the key in your env, NOT in code
  ],
  CURLOPT_POSTFIELDS    => json_encode([
    'prompt'    => $prompt,
    'category'  => 'realestate',
    'headline'  => $projectName,
    'brandText' => $developer,
    'ctaText'   => 'Enquire Now',
    // 'heroImageUrl' => $propertyPhotoUrl,   // optional
  ]),
  CURLOPT_TIMEOUT       => 120,
]);
$raw  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$res  = json_decode($raw, true);

if ($code === 200 && ($res['status'] ?? '') === 'completed') {
    $imageUrl = $res['image_url'];
    // 1) save $imageUrl + $res['poster_id'] in your MySQL
    // 2) display it, or publish via your existing meta/publish.php (Facebook/Instagram)
} else {
    error_log('PosterAI error: ' . ($res['error'] ?? $raw));
}
```

--------------------------------------------------------------------------------
## Notes
- **Security:** the key lives only in your server env. We never expose our OpenAI /
  Cloudinary keys. If you give us your server IP, we lock the key to it.
- **Images:** `image_url` is a permanent CDN URL — store it; you don't proxy or
  re-host anything. (Facebook/Instagram can fetch it directly.)
- **Auto-posting:** stays on your side — you already have `meta/publish.php`; just
  pass it the `image_url`.
- **Your own photos:** send `heroImageUrl` to use a specific property photo;
  omit it and we auto-source a relevant one.
- **Your existing data/site:** untouched. This is purely additive.
