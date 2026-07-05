# Customization Memory Rules: UI/UX & SEO/SXO Systems

This document captures the design methodologies, prompting sequences, and technical guidelines from the `ui-ux-pro-max-skill` and `claude-seo` frameworks. It serves as an active rulebook for future website UI and performance marketing builds.

---

## 1. UI/UX Pro Max Design Principles & Iteration Process

When starting a web interface design, follow this structured classification and enhancement sequence:

### Step A: Product Type & Style Mapping
Match the target website to the standard taxonomic profiles:
- **B2B Service / Consulting**: Alignment is *Trust & Authority + Minimalism*. Core items: Case studies, dynamic ROI calculations, and professional colors. Avoid pink/purple gradients or playful styles.
- **Marketing / Creative Agency**: Alignment is *Brutalism + Motion-Driven*. Core items: Bento grids, bold/expressive display typography, case study result cards, and dynamic grid visual layers.
- **SaaS / Micro SaaS**: Alignment is *Glassmorphism + Flat Design / Motion-Driven*. Core items: Interactive product calculators/demos, clear hero CTAs, and trust indicators.

### Step B: Standard Motion & Interaction Specs
- **Hover Micro-Interactions (Cards)**: Smooth displacement of `translateY(-4px to -6px) scale(1.015)` over `200-280ms` (avoid linear easings; use `cubic-bezier(.16, 1, .3, 1)` or `power2.out`).
- **Interactive Triggers (Icons)**: Nested elements (like cards' inside icon chips) should animate concurrently on hover (e.g. scale up by 8-10%, rotate 3-5 degrees, or brightness lift).
- **Staggered Scroll Reveals**: Use a layout container `reveal-stagger` with `reveal-up` children. Stagger entrance triggers by `0.06s` per item using `setTimeout` in an `IntersectionObserver` flow or dynamic CSS delays. Cap at 8 items to avoid lagginess.
- **Accessibility & UX Guards**:
  - Touch targets must be at least `44px x 44px` (preferably `48px+` or `52px` for sticky CTAs).
  - Respect `prefers-reduced-motion` to disable/simplify complex keyframes.
  - Active and focus states must have high contrast, custom-colored outlines (e.g., a gold or blue focus halo) for key navigation.

### Step C: QA Validation Sequence
For every build, run a browser-based visual QA check to verify:
1. Hover states trigger cleanly and reverse when cursor leaves rapidly (no "stuck" state).
2. Checklist score widgets adjust dynamically.
3. Sliders in ROI calculators trigger state redraws (conic-gradients, numeric text values) smoothly.
4. Colored cards trigger matching-tinted box shadows on hover.

---

## 2. SEO & Search Experience Optimization (SXO) Pipeline

Ensure every web interface is optimized for crawler discovery and search intent alignment:

### Step A: Metadata Checklist (On-Page SEO)
- **Title tag**: 55-60 characters, containing `[Primary Location] + [Service Keywords] + [Brand]`.
- **Meta description**: 145-160 characters, compelling, matching search intent, containing a call to action.
- **Canonical tag**: Self-referencing absolute link `<link rel="canonical" href="https://example.com/">` to solve duplicate path indexing.
- **Index directive**: `<meta name="robots" content="index, follow">`.
- **Social Graph tags**:
  - Open Graph: `og:type` (website), `og:title`, `og:description`, `og:url`, `og:image`.
  - Twitter Cards: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.

### Step B: Structured Data schemas (JSON-LD)
Inject JSON-LD blocks directly into server-rendered HTML:
- **`LocalBusiness` Schema**: Specifying location coordinates (`latitude`/`longitude`), telephone, region, address, priceRange, and openingHoursSpecification.
- **`WebSite` Schema**: Specifying the website entity name and canonical home URL.
- **Entity Resolution**: Avoid deprecated schemas (e.g., `HowTo` or `FAQPage` for rich result generation— retired by Google in May 2026). Keep existing FAQs only as search context markers.

### Step C: SXO Copywriting & Keyword Insertion
- **Local Kicker Badge**: Place a styled, small transactional heading kicker (e.g., `"Seattle Web Design & Growth Agency"`) directly above the primary hero H1 to anchor localized search rankings.
- **Alt Text Optimization**: Set descriptive alternative text on decorative/main images (e.g. `"Scenic forest stream representing conversions and web traffic"`).
- **Semantics**: Weave primary transactional keywords into section titles and subheaders naturally without cluttering readable copy.
