# Real-estate / developer poster — DESIGN DNA (extracted from 12 references)

Drop the actual image files in `posters/realestate/` (gitignored). This file is the
human-readable knowledge we extracted; the same patterns are encoded as RAG templates
in `lib/templates/realestate.ts`.

================================================================================
THE COMMON GRAMMAR (present in almost every reference)
================================================================================
A premium real-estate poster is built from these zones (top → bottom):

1. LOCATION TAG    — "SECTOR 31 / DUBAILAND / Nerul" with a 📍 pin, usually top.
2. DEVELOPER LOGO  — brand mark top (often TWO: developer + marketing agency).
3. EYEBROW         — small line above the name ("MODERN & LUXURY 1-2 BED").
4. PROJECT NAME    — the hero headline, large ELEGANT SERIF (Playfair/Cormorant),
                     sometimes 2-tone or with a script accent word.
5. PRICE / CONFIG  — "₹12CR. ONWARDS | 4000-4900 SQFT", "AED 585K", "10% Booking" —
                     usually inside a PILL or split by a thin divider.
6. HERO BUILDING   — tower/villa render, typically rising from the bottom or centered,
                     almost always at DUSK/SUNSET with a GRADIENT SKY.
7. FEATURE STRIP   — 3–4 icon + label columns (amenities/USPs) inside a SEMI-
                     TRANSPARENT "GLASS" PANEL ("13.3-acre community", "2 homes/floor").
8. SPEC / PAYMENT  — Down Payment %, Payment Plan (80/20), Handover (Q3-2026),
                     Sq.ft, BHK — in a dark GLASS panel with vertical dividers.
9. CTA PILL        — "Enquire today / Talk to an Expert / Book Now" (rounded, often outlined).
10. CONTACT        — phone + address with icons, bottom.
11. COMPLIANCE     — RERA / MahaRERA number + a QR code (small, top or bottom corner).
12. DECOR ACCENTS  — gold thin rules, location-pin graphics, faint project-name
                     watermark, dot/geometric marks.

================================================================================
THE 3 "PREMIUM" TECHNIQUES (what makes them look expensive)
================================================================================
A. ATMOSPHERIC DUSK SKY + HAZE/GLOW  ← the "blurry/smoky feel" you noticed
   - The building meets a soft GRADIENT SKY (blue→purple→peach, or pink→purple).
   - There is a gentle HAZE / GLOW where the towers fade into the sky at the top,
     plus warm window lights. This softness = the premium, cinematic feel.
   - HOW WE RECREATE IT: pick a dusk/twilight building photo; add a soft low-opacity
     gradient overlay from the sky color at the top fading to transparent over the
     building tops; warm glow near the horizon. (Needs shape-gradient support — see TODO.)

B. GLASSMORPHISM PANELS (frosted info strips/cards)
   - Feature strips and spec rows sit on SEMI-TRANSPARENT rounded rectangles
     (~25–45% opacity, light or dark), so the photo shows through softly.
   - HOW WE RECREATE IT: rounded rect (cornerRadius 16–28) with low opacity fill —
     already supported by our renderer.

C. KNOCKOUT / IMAGE-FILLED TEXT (giant word the photo shows through)
   - e.g. "LUXURY", "Spacious" — a huge headline where the interior photo fills the
     letters. Bold, editorial, eye-catching.
   - HOW WE RECREATE IT: needs canvas clip/composite text — see TODO (future renderer
     feature). For now approximate with a large bold solid headline.

================================================================================
PER-REFERENCE NOTES (archetype each one teaches)
================================================================================
1.  Birla Arika (Sector 31)   — DUSK TOWER + GLASS FEATURE STRIP. Purple/indigo dusk
                                 sky, 3 towers from bottom, serif name, price+sqft pill,
                                 4-icon glass amenity strip, location tag top-right,
                                 faint "BIRLA" watermark. Palette: indigo/lavender + white.
2.  Gadiyar (Minimalism)      — MINIMAL WHITE + GOLD. White bg, single render, gold
                                 geometric brand shape behind it, "How We Do/Minimalism",
                                 huge whitespace, carousel arrow. Palette: white/gold/charcoal.
3.  Address 17 (Sky Mktg)     — ROOFTOP LIFESTYLE. Deep-blue dusk, centered monogram,
                                 serif "APARTMENTS", booking %, bottom config row
                                 (Payment Plan | Bedrooms | Total Price). Palette: navy/white.
4.  Shreeji Destiny           — DUSK TOWER + GOLD ACCENTS. Blue/purple/gold sky, tower,
                                 script+bold headline, big gold location-pin graphic,
                                 gold bottom band (OC received / sizes), RERA + QR top.
5.  Prakrit Townhouses        — KNOCKOUT "LUXURY". Interior photo through giant letters,
                                 cream lower section, gold serif subhead, 3 amenity icons,
                                 RERA + site top. Palette: cream/brown/gold.
6.  Fairway Villas (Emaar)    — VILLA + DARK SPEC PANEL. Dual logos, "Premium Villa
                                 Communities" panel, villa-community photo, dark glass row
                                 (Down Payment/Payment Plan/Handover), tan CTA pill, contact.
7.  Sobha Elwood              — VILLA + GREEN GLASS PANEL. Villa photo, large dark-green
                                 semi-transparent lower panel: sqft/beds/price + KEY FEATURES
                                 row, brand + QR bottom. Palette: deep green/gold/white.
8.  Cove by Imtiaz (Realtree) — BLUE-SKY SERIF + ACCENT-LINE BLOCKS. Light-blue sky, big
                                 serif name, left-aligned info blocks each with a short
                                 vertical accent line, QR + agency logo bottom.
9.  Montiva by Vida (Emaar)   — SUNSET + GLASS CARDS. Pink/purple sunset, tower, stacked
                                 rounded glass cards on the right (BHK / price / booking %),
                                 dual logos bottom. Palette: sunset pink/purple + white.
10. Golf Hillside (QuikSell)  — BLUE-SKY + BIG NUMBERS. Tower, glass pill headline, outlined
                                 config pill, huge "10%" + "AED 1.47M", QR + website. 1:1.
11. S2 (Spacious Living)      — KNOCKOUT "Spacious". Interior view through giant letters,
                                 green serif + script top, dark contact bar bottom. 1:1.
12. Ferro (Step into vision)  — ATMOSPHERIC SKETCH-TO-REALITY. Dusk house with sketch/haze
                                 blend, serif+script headline, highlighted-word PILLS
                                 ("Drawing", "Dream"), verified badge, contact bar.

================================================================================
PALETTES SEEN (use these for realestate templates)
================================================================================
- Dusk indigo/lavender + gold + white   (Birla, Shreeji)
- Deep blue + white + serif              (Address 17, Cove, Golf Hillside)
- Sunset pink/purple + white             (Montiva)
- Warm cream/brown/gold                  (Prakrit, Gadiyar)
- Deep forest green + gold + white       (Sobha)
- Blue sky + cream + dark                (Ferro, Fairway)

================================================================================
TODO (renderer features to unlock the last 10% of the look)
================================================================================
- [ ] Shape GRADIENT fill support (for the atmospheric haze overlay + gradient panels).
- [ ] Knockout / image-filled text (Konva clip or globalCompositeOperation).
- [ ] True "cover" fit + focal point for the hero photo.
- [ ] Glass blur (Konva filters) for stronger glassmorphism.
