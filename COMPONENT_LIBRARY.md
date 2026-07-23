# HackUnion UI Component Library

This document defines the reusable UI component library for HackUnion v2. Components are implemented as shared SCSS partials and reusable JavaScript modules so future pages can assemble interfaces without rebuilding UI patterns.

## Principles

- Reuse components instead of duplicating section-specific UI.
- Favor semantic HTML first, modifiers second, JavaScript last.
- Keep all interaction keyboard-accessible and WCAG 2.2 AA-friendly.
- Use the existing design tokens, spacing scale, motion scale, and radius scale.

## Components

### Buttons

Supported variants: `button--primary`, `button--secondary`, `button--outline`, `button--ghost`, `button--text`, `button--icon`

Supported sizes: `button--sm`, default medium, `button--lg`

Supported states: default, hover, active, focus-visible, disabled, `is-loading`

```html
<button class="button button--primary button--lg">
  <span class="button__label">Join Community</span>
</button>

<a class="button button--outline" href="#experiences">Explore Experiences</a>

<button class="button button--ghost button--icon" type="button" aria-label="Open menu">
  <span data-lucide="menu"></span>
</button>

<button class="button button--secondary is-loading" type="button" disabled>
  <span class="button__loader" aria-hidden="true"></span>
  <span class="button__label">Loading</span>
</button>
```

### Cards

Supported variants: `card--default`, `card--experience`, `card--feature`, `card--team`, `card--gallery`, `card--story`, `card--partner`, `card--project`, `card--event`

```html
<article class="card card--feature u-card-hover">
  <div class="card__media">
    <img src="./images/example.webp" alt="Example feature" loading="lazy" />
  </div>
  <div class="card__body">
    <span class="badge badge--featured card__badge">Featured</span>
    <h3 class="card__title">Build real projects</h3>
    <p class="card__description">Turn ideas into visible work with serious collaborators.</p>
    <div class="card__actions">
      <a class="button button--text" href="#">Learn more</a>
    </div>
  </div>
</article>
```

### Badges

Available modifiers: `badge--community`, `badge--upcoming`, `badge--flagship`, `badge--open-source`, `badge--ai`, `badge--workshop`, `badge--meetup`, `badge--hackathon`, `badge--new`, `badge--featured`

```html
<span class="badge badge--hackathon">Hackathon</span>
```

### Tags

```html
<span class="tag tag--accent">Builder-first</span>
```

### Section Header

```html
<div class="section-header section-header--split">
  <div>
    <p class="section-header__eyebrow">Experiences</p>
    <h2 class="section-header__title">Places to build, learn, and move faster.</h2>
    <p class="section-header__text">HackUnion experiences are designed for collaboration, momentum, and real output.</p>
  </div>
  <div class="section-header__actions">
    <a class="button button--secondary" href="#">Explore</a>
  </div>
</div>
```

### Statistics Component

```html
<div class="statistics-list">
  <article class="statistics-item">
    <div class="statistics-item__icon"><span data-lucide="sparkles"></span></div>
    <div class="statistics-item__value" data-counter="700">700+</div>
    <div class="statistics-item__label">Builders Connected</div>
    <p class="statistics-item__description">People who have shown up, shipped, and contributed.</p>
  </article>
</div>
```

### Feature List

```html
<ul class="feature-list">
  <li class="feature-list__item">
    <span class="feature-list__icon"><span data-lucide="check"></span></span>
    <span class="feature-list__text">
      <span class="feature-list__title">Learn by building</span>
      <span class="feature-list__description">Hands-on collaboration instead of passive content.</span>
    </span>
  </li>
</ul>
```

### CTA Banner

```html
<section class="cta-banner">
  <div class="cta-banner__copy">
    <h2 class="cta-banner__title">Ready to build with HackUnion?</h2>
    <p class="cta-banner__text">Join a community designed around meaningful work and long-term momentum.</p>
  </div>
  <div class="cta-banner__actions">
    <a class="button button--primary" href="#">Join</a>
    <a class="button button--secondary" href="#">Learn More</a>
  </div>
</section>
```

### Forms

```html
<form class="form-group" novalidate>
  <div class="form-row">
    <div class="form-field">
      <label class="form-label" for="name">Name</label>
      <input id="name" class="form-input" type="text" />
      <p class="form-help">Use your full name.</p>
    </div>
    <div class="form-field is-error">
      <label class="form-label" for="email">Email</label>
      <input id="email" class="form-input" type="email" aria-invalid="true" />
      <p class="form-message form-message--error">A valid email is required.</p>
    </div>
  </div>

  <label class="form-choice form-choice--checkbox">
    <input type="checkbox" />
    <span class="form-choice__indicator"></span>
    <span>Send me community updates</span>
  </label>

  <label class="form-toggle">
    <input type="checkbox" />
    <span class="form-toggle__track"></span>
    <span>Enable notifications</span>
  </label>
</form>
```

### Accordion

```html
<div class="accordion" data-accordion data-accordion-single>
  <section class="accordion__item">
    <button class="accordion__trigger" type="button" data-accordion-button aria-expanded="false" aria-controls="faq-one">
      <span>What is HackUnion?</span>
      <span class="accordion__icon" aria-hidden="true"></span>
    </button>
    <div id="faq-one" class="accordion__panel" hidden>
      HackUnion is a builder-first technology community.
    </div>
  </section>
</div>
```

### Modal

```html
<button class="button button--primary" data-modal-open="#example-modal">Open modal</button>

<div class="modal modal--content" id="example-modal" data-modal aria-hidden="true">
  <div class="modal__overlay" data-modal-overlay></div>
  <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="example-modal-title">
    <div class="modal__header">
      <h2 id="example-modal-title">Modal title</h2>
      <button class="button button--ghost button--icon modal__close" type="button" data-modal-close aria-label="Close modal">×</button>
    </div>
    <div class="modal__body">Modal body content</div>
  </div>
</div>
```

### Tabs

```html
<div class="tabs" data-tabs>
  <div class="tabs__list" role="tablist" aria-label="Example tabs">
    <button class="tabs__button" type="button" role="tab" aria-selected="true" aria-controls="tab-panel-1" id="tab-1">Overview</button>
    <button class="tabs__button" type="button" role="tab" aria-selected="false" aria-controls="tab-panel-2" id="tab-2">Details</button>
  </div>
  <section class="tabs__panel" id="tab-panel-1" role="tabpanel" aria-labelledby="tab-1">Overview content</section>
  <section class="tabs__panel" id="tab-panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Detailed content</section>
</div>
```

### Breadcrumb

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="./">Home</a></li>
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="#experiences">Experiences</a></li>
    <li class="breadcrumb__item" aria-current="page">Builders Guild</li>
  </ol>
</nav>
```

### Pagination

```html
<nav class="pagination" aria-label="Pagination">
  <a class="pagination__link" href="#">Prev</a>
  <a class="pagination__link" href="#" aria-current="page">1</a>
  <a class="pagination__link" href="#">2</a>
  <a class="pagination__link" href="#">Next</a>
</nav>
```

### Social Icons

```html
<div class="social-icons" aria-label="Social links">
  <a class="social-icons__link" href="https://github.com" aria-label="GitHub"><span data-lucide="github"></span></a>
  <a class="social-icons__link" href="https://www.linkedin.com/company/hackunion-in/" aria-label="LinkedIn"><span data-lucide="linkedin"></span></a>
</div>
```

### Empty State

```html
<section class="empty-state">
  <div class="empty-state__icon"><span data-lucide="search-x"></span></div>
  <h2 class="empty-state__title">Nothing here yet</h2>
  <p class="empty-state__text">This area is ready for future content without needing a redesign.</p>
  <a class="button button--primary" href="#">Go back</a>
</section>
```

### Loading Components

```html
<div class="spinner" aria-hidden="true"></div>
<div class="skeleton skeleton--title" aria-hidden="true"></div>
<div class="skeleton skeleton--card" aria-hidden="true"></div>
```

### Toast Notifications

```html
<button
  class="button button--secondary"
  type="button"
  data-toast-trigger
  data-toast-tone="success"
  data-toast-title="Saved"
  data-toast-message="Your settings were updated."
>
  Show Toast
</button>
```

### Back To Top Button

```html
<button class="button button--primary back-to-top" type="button" data-back-to-top-global aria-label="Back to top">
  <span data-lucide="arrow-up"></span>
</button>
```

### Scroll Indicator

```html
<div class="scroll-indicator" data-scroll-indicator aria-hidden="true">
  <div class="scroll-indicator__bar" data-scroll-indicator-bar></div>
</div>
```

## Animation Utilities

Utility classes live in the shared utilities layer.

- `u-animate-fade-up`
- `u-animate-fade-down`
- `u-animate-fade-left`
- `u-animate-fade-right`
- `u-animate-scale`
- `u-animate-zoom`
- `u-stagger`
- `u-hover-lift`
- `u-card-hover`
- `u-button-hover`

## JavaScript Modules

- `initAccordion()` for accordions with optional single-open behavior.
- `initModal()` for modal open/close, overlay close, escape close, and focus trapping.
- `initTabs()` for keyboard-accessible tabs.
- `showToast()` and `initToasts()` for toast notifications.
- `initBackToTop()` for reusable floating back-to-top buttons.
- `initScrollIndicator()` for progress bars.

## File Map

- SCSS partials: `src/styles/components/*.scss`
- Animation utilities: `src/styles/utilities/_animations.scss`
- Interaction modules: `src/scripts/modules/*.js`
- Global bootstrap: `src/scripts/main.js`

Use this library as the default source of truth before creating any new page-level or section-level UI.