# HackUnion Animation & Interaction System

This document defines the reusable motion and interaction layer for HackUnion v2. It is designed to keep every future page consistent, performant, and accessible.

## Principles

- Use transform and opacity first.
- Use CSS transitions for local interactions.
- Use Intersection Observer for reveal and trigger logic.
- Use GSAP only where advanced sequencing adds real value.
- Respect `prefers-reduced-motion` automatically.
- Never hide content permanently when JavaScript or observers are unavailable.

## Core Modules

### `src/scripts/modules/animations.js`

Global reveal engine.

Supports:

- `data-animate="fade-up"`
- `data-animate="fade-down"`
- `data-animate="fade-left"`
- `data-animate="fade-right"`
- `data-animate="scale"`
- `data-animate="zoom"`
- `data-stagger`
- subtle page entrance via `body.is-page-ready`

Usage:

```html
<section data-animate="fade-up">...</section>

<div data-stagger>
  <article>...</article>
  <article>...</article>
  <article>...</article>
</div>
```

### `src/scripts/modules/scroll.js`

Global smooth-scroll helper built on Lenis.

Exports:

- `initScroll()`
- `scrollToTop()`
- `scrollToTarget(target, options)`
- `destroyScroll()`

### `src/scripts/modules/counter.js`

Reusable once-only counter engine.

Supported attributes:

- `data-counter="700"`
- `data-counter-target="700"`
- `data-counter-prefix="$"`
- `data-counter-suffix="+"`
- `data-counter-duration="1400"`

Usage:

```html
<span data-counter-target="700" data-counter-suffix="+">700+</span>
```

### `src/scripts/modules/image-lazy-loading.js`

Reusable image lazy-loading and reveal logic.

Supported selectors:

- `img[data-lazy]`
- `img[data-src]`
- `img[data-reveal-image]`

Images load lazily, then receive `.is-loaded` for reveal styling.

Usage:

```html
<img
  data-src="./images/example.webp"
  src="data:image/svg+xml,..."
  alt="Example"
  loading="lazy"
  decoding="async"
/>
```

### `src/scripts/modules/navigation.js`

Handles interactive navbar behavior.

Supports:

- sticky header
- scroll direction detection
- hide on scroll down
- reveal on scroll up
- transparent to solid transition
- mobile menu open/close
- body scroll lock
- Escape key support
- focus trap

### `src/scripts/modules/accordion.js`

Supports:

- open/close state
- optional single-open behavior via `data-accordion-single`
- Arrow Up / Arrow Down / Home / End keyboard navigation

Usage:

```html
<div class="accordion" data-accordion data-accordion-single>
  <section class="accordion__item">
    <button data-accordion-button aria-expanded="false" aria-controls="faq-1">Question</button>
    <div id="faq-1" hidden>Answer</div>
  </section>
</div>
```

### `src/scripts/modules/modal.js`

Supports:

- open / close
- overlay click close
- Escape close
- focus trapping
- focus restore to trigger

### `src/scripts/modules/back-to-top.js`

Reusable global back-to-top visibility and smooth scroll.

Usage:

```html
<button class="back-to-top button button--primary" data-back-to-top-global type="button">
  <span data-lucide="arrow-up"></span>
</button>
```

### `src/scripts/modules/scroll-indicator.js`

Reusable page progress bar.

Usage:

```html
<div class="scroll-indicator" data-scroll-indicator aria-hidden="true">
  <div class="scroll-indicator__bar" data-scroll-indicator-bar></div>
</div>
```

### `src/scripts/modules/gallery.js`

Adds reusable hover preparation to gallery items and preserves list semantics.

## Utility Classes

Defined in `src/styles/utilities/_animations.scss`.

### Reveal utilities

- `.u-animate-fade-up`
- `.u-animate-fade-down`
- `.u-animate-fade-left`
- `.u-animate-fade-right`
- `.u-animate-scale`
- `.u-animate-zoom`
- `.u-animate-in`

### Stagger

- `.u-stagger`
- `[data-stagger]`

### Hover system

- `.u-hover-lift`
- `.u-card-hover`
- `.u-button-hover`
- `[data-hover="lift"]`
- `[data-hover="card"]`
- `[data-hover="button"]`
- `[data-hover="cta"]`
- `[data-hover="media"]`
- `[data-hover="gallery"]`
- `[data-hover="logo"]`
- `[data-hover="icon"]`

### Floating elements

- `[data-float]`
- `[data-float="reverse"]`

### Image reveal

- `img[data-reveal-image]`
- `.is-loaded`

## Usage Examples

### Scroll reveal

```html
<div class="card" data-animate="fade-up">...</div>
<div class="card" data-animate="fade-left">...</div>
```

### Stagger reveal

```html
<div class="grid" data-stagger>
  <article class="card">One</article>
  <article class="card">Two</article>
  <article class="card">Three</article>
</div>
```

### Hover lift card

```html
<article class="card u-card-hover">...</article>
```

### Floating decorative card

```html
<div class="card" data-float style="--float-duration: 7s;">...</div>
```

### Gallery image interaction

```html
<figure data-hover="gallery">
  <img src="./images/sample.webp" alt="Gallery sample" />
</figure>
```

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- reveal elements render immediately
- image blur/scale reveal is disabled
- floating animations are disabled
- hover motion is simplified
- page entrance motion is removed
- counters render final values immediately
- Lenis smooth scrolling is skipped

## Performance Notes

- All reveal effects use opacity and transform.
- No layout-thrashing animations are used.
- Intersection observers trigger once and unobserve immediately.
- Global modules are initialized after dynamic sections render so homepage-generated content also uses the shared system.

## Current GSAP Usage

GSAP remains reserved for advanced hero sequencing only. The rest of the global system relies on CSS transitions, Intersection Observer, and lightweight DOM logic.