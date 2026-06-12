import type { DesignTemplateMetadata } from '@/types/rag';

/**
 * Real-estate / developer templates — hand-authored from 12 professional
 * reference posters (see posters/reference-dna.md). These teach the RAG layer
 * the real grammar of premium property posters: developer logo, location tag,
 * serif project name, price/config pill, dusk hero building, glass feature/spec
 * strips, CTA pill, RERA + QR, and the atmospheric dusk-sky "premium" feel.
 */
export const REALESTATE_TEMPLATE_METADATA: DesignTemplateMetadata[] = [
  {
    // Birla Arika / Shreeji — dusk towers + glass amenity strip
    headline_position: 'top-center',
    cta_position: 'bottom-center',
    font_pair: ['Playfair Display', 'Switzer'],
    palette: ['#2A2350', '#6B5BA8', '#C8B273', '#FFFFFF', '#E8E2F5'],
    spacing_style: 'airy',
    visual_density: 'medium',
    background_type: 'image',
    composition_notes:
      'Dusk high-rise launch. Location tag with pin top-right; faint project-name watermark. Eyebrow line, then large serif project name centered. A price+sqft PILL under the name. Hero towers rise from the bottom against an indigo→lavender→peach DUSK gradient sky with soft haze/glow at the tower tops. A semi-transparent GLASS feature strip holds 4 icon+label amenity columns separated by thin dividers.',
    layer_order: ['background-photo', 'atmospheric-sky-overlay', 'location-tag', 'name-watermark', 'eyebrow', 'project-name', 'price-pill', 'glass-feature-strip', 'feature-icons'],
    design_rules: [
      'Dusk/twilight building photo; add a soft atmospheric gradient overlay (sky color → transparent) over the tower tops for the premium hazy feel',
      'Project name in elegant serif (Playfair Display), 96-130px, centered',
      'Price + sqft inside a bordered pill split by a thin vertical divider',
      'Amenities in a frosted glass strip: 4 columns, small icon + 2-3 word label each',
      'Location tag with a pin icon, top-right; gold accents kept subtle',
    ],
    example_prompt: 'Luxury high-rise launch poster, dusk towers, project name, price onwards, 4 amenity highlights, RERA, premium feel',
  },
  {
    // Cove / Montiva / Golf Hillside — blue/sunset sky + glass info cards
    headline_position: 'top-left',
    cta_position: 'bottom-right',
    font_pair: ['Playfair Display', 'Inter'],
    palette: ['#7FA8C9', '#2C4A63', '#F2C879', '#FFFFFF', '#1B2B3A'],
    spacing_style: 'airy',
    visual_density: 'low',
    background_type: 'image',
    composition_notes:
      'Branded apartment tower against a clean blue or pink-sunset sky. Large serif project name top; eyebrow + "BY <developer>" beneath. Left- or right-aligned stack of rounded GLASS info cards (BHK config, "Starting from AED ...", "Book with 10%"), each card a semi-transparent rounded rect. Developer + agency logos and a compliance QR at the bottom.',
    layer_order: ['background-photo', 'atmospheric-sky-overlay', 'project-name', 'developer-byline', 'glass-info-cards', 'logos', 'qr'],
    design_rules: [
      'Airy, lots of sky; tower occupies one side, text the other',
      'Project name serif 100-150px; understated, elegant',
      'Info cards: rounded rects (cornerRadius 18-28) at ~30% opacity with crisp white text',
      'Big standout number for price or booking % (e.g. AED 1.47M, 10%)',
      'Dual brand logos bottom; small QR for RERA/permit',
    ],
    example_prompt: 'Branded apartments poster, blue sky tower, starting price card, booking 10%, handover date, agency logo',
  },
  {
    // Sobha / Fairway — villa photo + dark glass spec panel + CTA
    headline_position: 'bottom-left',
    cta_position: 'bottom-center',
    font_pair: ['Outfit', 'Inter'],
    palette: ['#1E2A22', '#2F4536', '#C8A85A', '#FFFFFF', '#D8DED6'],
    spacing_style: 'balanced',
    visual_density: 'medium',
    background_type: 'image',
    composition_notes:
      'Premium villa community. Villa/greenery render fills the top ~60%. A large dark, semi-transparent GLASS panel covers the lower portion holding the headline ("Luxurious 7,000 Sq.ft 6-Bedroom Villas"), a one-line value prop, a "starting from" price, and a KEY FEATURES row of 3 columns (private pool / elevator / parking). A pill CTA ("Enquire today") and contact/QR at the very bottom.',
    layer_order: ['background-photo', 'dark-glass-panel', 'headline', 'value-prop', 'price', 'key-features-row', 'cta-pill', 'contact'],
    design_rules: [
      'Lower-third dark glass panel (deep green/charcoal, ~70% opacity) for crisp text',
      'Headline 60-90px; gold for the key figure (sqft / bedrooms / price)',
      'KEY FEATURES: 3 columns separated by thin vertical gold dividers',
      'Rounded CTA pill; phone + address with small icons at the bottom',
    ],
    example_prompt: 'Luxury villa community poster, large villa photo, dark spec panel with sqft beds price, key features, enquire CTA',
  },
  {
    // Prakrit / S2 — knockout (image-filled) giant word + cream section
    headline_position: 'center',
    cta_position: 'bottom-left',
    font_pair: ['Oswald', 'Inter'],
    palette: ['#F3ECE1', '#7A5C3E', '#C8A85A', '#2B1F16', '#FFFFFF'],
    spacing_style: 'balanced',
    visual_density: 'medium',
    background_type: 'image',
    composition_notes:
      'Editorial interior feature. A warm interior photo sits behind a GIANT knockout headline word ("LUXURY" / "SPACIOUS") that the photo shows through. Below, on a clean cream section: a gold serif sub-headline ("Unparalleled Living, Unmatched Luxury"), a short amenity icon row (3 items), and project + location lines at the bottom. Developer logo and RERA/site top.',
    layer_order: ['background-photo', 'knockout-word', 'cream-section', 'serif-subhead', 'amenity-icons', 'project-location', 'logo'],
    design_rules: [
      'Giant bold word as hero (knockout/image-filled if available, else solid bold)',
      'Warm cream/brown/gold palette; gold serif for the sub-headline',
      'Amenity icons in small gold circles with 2-word labels',
      'Project name bottom-left, location bottom-right',
    ],
    example_prompt: 'Luxury townhouse interior poster, giant LUXURY headline, amenity icons, cream and gold, RERA',
  },
  {
    // Gadiyar — minimal white + gold, single render, huge whitespace
    headline_position: 'top-left',
    cta_position: 'bottom-right',
    font_pair: ['Outfit', 'Inter'],
    palette: ['#FBFAF7', '#C2A35A', '#2A2A2A', '#8A8A8A', '#FFFFFF'],
    spacing_style: 'airy',
    visual_density: 'low',
    background_type: 'solid',
    composition_notes:
      'Architect/developer brand statement. Clean white canvas, enormous whitespace. A single sharp architectural render sits right-of-center over a large faint GOLD geometric brand shape. Two-line headline top-left ("How We Do / Minimalism") with the key word in gold. Brand logo top-right; a small circular "next" arrow bottom-right.',
    layer_order: ['white-background', 'gold-geometric-mark', 'building-render', 'headline', 'logo', 'next-arrow'],
    design_rules: [
      'Maximal whitespace = premium minimalism; very low visual density',
      'One gold accent color does all the work',
      'Headline mixes a neutral word + a gold emphasis word',
      'Single crisp building render, no clutter',
    ],
    example_prompt: 'Minimal architecture brand poster, white and gold, single building render, lots of whitespace',
  },
  {
    // Ferro — atmospheric sketch-to-reality + highlighted-word pills
    headline_position: 'top-center',
    cta_position: 'bottom-center',
    font_pair: ['Playfair Display', 'Inter'],
    palette: ['#A9C3DA', '#243A4E', '#E9D9B0', '#2B1A12', '#FFFFFF'],
    spacing_style: 'balanced',
    visual_density: 'medium',
    background_type: 'image',
    composition_notes:
      'Builder vision/storytelling. A dusk luxury house render with an architectural SKETCH/haze blending into the photoreal image (atmospheric). Serif + script headline ("Step into the vision"). A short narrative line where key words sit in small rounded HIGHLIGHT PILLS ("From a [Drawing] on paper to a [Dream] under the sky"). A small verified badge, and a contact bar (phones + website) at the bottom.',
    layer_order: ['background-photo', 'sketch-haze-overlay', 'headline', 'script-accent', 'narrative-with-pills', 'verified-badge', 'contact-bar'],
    design_rules: [
      'Atmospheric haze/sketch blend over the building for a dreamy, premium feel',
      'Mix a serif headline with a script accent word',
      'Highlight 1-2 key words inside small rounded pills',
      'Contact bar (phone + website) along the bottom edge',
    ],
    example_prompt: 'Construction builder vision poster, dusk house render, From drawing to dream, contact details, premium',
  },
  {
    // Address 17 — rooftop lifestyle + bottom config row
    headline_position: 'center',
    cta_position: 'bottom-center',
    font_pair: ['Playfair Display', 'Inter'],
    palette: ['#15314F', '#3E6E9C', '#E7C98A', '#FFFFFF', '#0C1E33'],
    spacing_style: 'balanced',
    visual_density: 'medium',
    background_type: 'image',
    composition_notes:
      'Lifestyle-led apartments. A dusk rooftop/terrace lifestyle photo (warm lights, skyline). Centered brand monogram top. Eyebrow + large serif "APARTMENTS" with a "Booking starting from | 15%" split line. A mood caption over the photo ("CHIC ROOFTOP MOMENTS"). A bottom info row of 3 columns (Payment Plan | Bedrooms | Total Price) separated by dividers, agency logo at the very bottom.',
    layer_order: ['background-photo', 'top-scrim', 'brand-monogram', 'eyebrow', 'headline', 'booking-split', 'mood-caption', 'bottom-config-row', 'agency-logo'],
    design_rules: [
      'Deep-blue dusk lifestyle photo; light scrim at top for the logo + headline',
      'Serif headline; booking % split by a thin vertical divider',
      'Bottom config row: 3 labelled columns with dividers',
      'Centered, balanced, aspirational tone',
    ],
    example_prompt: 'Luxury rooftop apartments poster, dusk terrace lifestyle, booking 15%, payment plan bedrooms price row',
  },
];
