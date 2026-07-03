# open design4.0

A reusable web-UI template system. `template/` is a single-page marketing
site (currently themed as a fictional agency, "Cascade") built to be
forked/customized per client. No build step — plain HTML/CSS/JS.

## Structure

- `template/` — the canonical, actively-developed template. Start every new
  client build by copying this folder, not by editing it in place.
- `archive/` — superseded design iterations (formerly folders 2-5), kept for
  reference only. `archive/2`→`archive/4` are one incremental thread fully
  superseded by `template/`. `archive/5` has a distinct bubble-backdrop +
  animated donut-chart technique not used elsewhere — worth a look if a
  future client wants that visual style.
- `best principles.md` — plain-text copy dump of everything on the page,
  regenerated from `template/index.html`. Treat `index.html` as the source
  of truth for copy; regenerate this file (don't hand-edit it) whenever
  copy changes.
- `.claude/serve.ps1` — a local static file server for previewing a folder
  (defaults to port 8765). Use this instead of writing a new ad-hoc server —
  a past session didn't know this existed and reimplemented one from scratch.

This project has no build tooling, no package.json, and (as of this
cleanup) is a git repo — commit before large structural changes.

## Template architecture (`template/`)

- `index.html` — single file, section-commented (`<!-- ==== SECTION ==== -->`).
- `css/style.css` — one stylesheet, no preprocessor. Design tokens live in
  `:root` at the top: a three-tier color system (calm structural fills for
  cards/icons → one darker text-safe accent for numbers/labels → one vivid
  "pop" color reserved for primary CTAs/highlights), plus radius and spacing
  scales. **This is the place to touch when re-theming for a new client
  brand** — swap the `--brand-*`/`--primary`/`--illo-*` values rather than
  hunting for hardcoded colors in rules.
- `js/main.js` — vanilla JS only, no dependencies. Handles: anchor smooth-scroll
  (with a manual header-height offset, see `HEADER_OFFSET`), sticky-header
  border, mobile nav toggle, scroll-reveal + count-up stats via
  `IntersectionObserver`, and the contact form's client-side submit handling.
- External dependencies (CDN, no local install): Google Fonts (Figtree +
  Inter), Phosphor Icons (regular/bold/fill — all three weights are actually
  used, don't drop one without checking usage first). That's it — GSAP,
  ScrollTrigger, and Lenis were removed (see Lessons below).

## Placeholder content to swap per client

None of this is real yet — replace before showing to an actual client:
`Cascade` (brand name/logo), `(206) 555-0148`, `hello@cascade.co`,
`Nolan` (founder name/bio), `Seattle, Washington`, the 3 testimonials
(fabricated names/quotes), the founder photo (there's an HTML comment in
the `founder` section showing the exact `<img>` swap), and the sample
teardown numbers in the proof section. There's no `{{TOKEN}}` convention in
place yet — if this template gets forked for many clients, consider
introducing one so a find-replace pass is mechanical.

## Lessons learned (apply these going forward)

- **When deleting a section from `index.html`, grep its class names across
  `css/style.css` and `js/main.js` in the same pass.** This codebase had
  three fully orphaned sections (`.pricing`, `.founding-offer`,
  `.risk-banner`) accumulate because CSS/JS weren't cleaned up when the HTML
  was removed — ~80 dead lines of CSS and a dead JS handler.
- **Before reaching for an animation library, check whether the vanilla
  fallback already covers it.** `main.js` had a full `IntersectionObserver`
  fallback for when GSAP/ScrollTrigger/Lenis failed to load — meaning the
  "real" path and the fallback path did the same job twice. The libraries
  also had a real bug (double-driving `lenis.raf()` once via a raw rAF loop
  and once via `gsap.ticker`, wasting work and risking scroll jitter). All
  three were removed; the fallback is now the only path.
- **No git means no safe deletions.** This directory had 5 hand-copied
  version folders (`2`-`6`) because there was no version control — every
  new direction got a new numbered folder instead of a commit. Git is now
  initialized at the root; use commits for iteration going forward instead
  of copying the whole template into a new folder.
- **When several CTAs point to the same destination, differentiate the
  copy by the section's context** (e.g. a persistent header CTA reads
  differently than one after a pricing card or at the bottom of a
  step-by-step process) rather than repeating the same phrase everywhere.

## Open question from the last session

The user asked to review "efficiency" and "temperature" — efficiency was
addressed (dead code removal, dependency reduction). "Temperature" wasn't
clarified before the session ended; it most likely means the warm color
token system described above, but confirm before doing more work framed
around that word.
