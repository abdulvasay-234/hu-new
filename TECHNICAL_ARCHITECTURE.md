# HackUnion v2 Technical Architecture

## 1. Architecture Purpose
This document defines the technical blueprint for HackUnion v2. It establishes how the static website should be structured, built, organized, optimized, and deployed before implementation begins.

The architecture is designed for a modern, modular, maintainable, and scalable static website built with HTML5, SCSS, CSS3, Vanilla JavaScript, Vite, GSAP where meaningful, Lenis for smooth scrolling, Lucide Icons, and GitHub Pages deployment.

## 2. Technical Principles
- Separate structure, styling, and behavior.
- Keep the codebase modular and reusable.
- Favor static rendering and progressive enhancement.
- Optimize for maintainability before convenience.
- Avoid framework overhead.
- Keep animation and scrolling enhancements purposeful.
- Design for performance, accessibility, and SEO from the start.
- Make the architecture easy to extend without rewrites.

## 3. Folder Structure
### Recommended Project Structure
```text
hackunion-v2/
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── illustrations/
│   │   ├── icons/
│   │   └── fonts/
│   ├── styles/
│   │   ├── abstracts/
│   │   ├── base/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── themes/
│   │   ├── utilities/
│   │   └── vendors/
│   ├── scripts/
│   │   ├── modules/
│   │   ├── components/
│   │   ├── services/
│   │   ├── data/
│   │   ├── utils/
│   │   └── main.js
│   ├── data/
│   ├── templates/
│   └── main.scss
├── index.html
├── about.html
├── community.html
├── projects.html
├── experiences.html
├── events.html
├── partners.html
├── resources.html
├── blog.html
├── contact.html
├── join.html
├── volunteer.html
├── privacy-policy.html
├── terms.html
├── code-of-conduct.html
├── 404.html
├── package.json
├── vite.config.js
└── README.md
```

### Folder Purpose
- public/: static files copied as-is into the build output.
- src/assets/: source-managed media and assets.
- src/styles/: SCSS source architecture.
- src/scripts/: modular JavaScript behavior.
- src/data/: structured site data and content models.
- src/templates/: reusable HTML fragments or generation helpers if needed later.
- root HTML files: page entry points for the static site.

### Usage Guidelines
- Keep page entry files lightweight.
- Move reusable logic into shared modules.
- Store source assets in src/ and publish-ready assets in public/ only when required.
- Keep root-level HTML files aligned with the sitemap.

### Do's
- Do maintain a clear separation between source files and deployable static assets.
- Do keep directories grouped by responsibility.
- Do use predictable names for content and shared modules.

### Don'ts
- Don't place all styles or scripts in one file.
- Don't mix source and output assets without a clear reason.
- Don't create deeply nested folders without functional value.

### Best Practices
- Use the folder structure as an organizational contract.
- Keep future expansion paths obvious from the start.
- Preserve consistency between routing, templates, and content files.

## 4. SCSS Architecture

### Purpose
The SCSS architecture provides a scalable styling system that supports design tokens, shared patterns, page-specific adjustments, and theming without duplication.

### Recommended Structure
```text
src/styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   ├── _tokens.scss
│   ├── _breakpoints.scss
│   └── _index.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   ├── _global.scss
│   ├── _forms.scss
│   ├── _links.scss
│   └── _index.scss
├── components/
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _badges.scss
│   ├── _tags.scss
│   ├── _forms.scss
│   ├── _navigation.scss
│   ├── _footer.scss
│   ├── _modals.scss
│   ├── _tooltips.scss
│   ├── _alerts.scss
│   ├── _accordions.scss
│   ├── _timelines.scss
│   ├── _galleries.scss
│   ├── _testimonials.scss
│   ├── _stats.scss
│   ├── _section-headers.scss
│   └── _ctas.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _grid.scss
│   ├── _containers.scss
│   ├── _sections.scss
│   └── _page-shell.scss
├── sections/
│   ├── _hero.scss
│   ├── _proof-band.scss
│   ├── _feature-grid.scss
│   ├── _project-showcase.scss
│   ├── _experience-list.scss
│   ├── _partner-grid.scss
│   ├── _story-section.scss
│   ├── _cta-band.scss
│   └── _content-band.scss
├── pages/
│   ├── _home.scss
│   ├── _about.scss
│   ├── _community.scss
│   ├── _projects.scss
│   ├── _experiences.scss
│   ├── _events.scss
│   ├── _partners.scss
│   ├── _resources.scss
│   ├── _blog.scss
│   ├── _contact.scss
│   ├── _join.scss
│   └── _volunteer.scss
├── themes/
│   ├── _light.scss
│   ├── _dark.scss
│   └── _index.scss
├── utilities/
│   ├── _spacing.scss
│   ├── _display.scss
│   ├── _text.scss
│   ├── _visibility.scss
│   ├── _state.scss
│   └── _index.scss
├── vendors/
│   ├── _gsap.scss
│   └── _lenis.scss
└── main.scss
```

### SCSS Layer Responsibilities
- abstracts/: tokens, variables, mixins, and core helpers.
- base/: resets, element-level defaults, and global typographic rules.
- components/: reusable UI primitives.
- layout/: structural scaffolding and site-wide layout rules.
- sections/: large reusable page sections.
- pages/: page-specific overrides and composition styles.
- themes/: light and dark theme definitions.
- utilities/: single-purpose helpers and state classes.
- vendors/: adjustments or integration styles for third-party libraries.

### Usage Guidelines
- Keep tokens and variables centralized.
- Prefer component-level composition over page-specific overrides.
- Keep page styles thin and only for genuine page-specific needs.
- Limit utility classes to consistent, reusable helpers.

### Do's
- Do use SCSS partials and imports in a clear hierarchy.
- Do separate structural styles from decorative styles.
- Do keep theme output predictable and token-driven.

### Don'ts
- Don't scatter magic numbers throughout the codebase.
- Don't place all styles in a single stylesheet.
- Don't create style rules that bypass the system.

### Best Practices
- Use a token-first approach.
- Keep styles readable and easy to audit.
- Let shared patterns evolve through reusable modules.

## 5. CSS Variables Strategy

### Purpose
CSS variables provide runtime theming, token consistency, and a clean bridge between design system values and implementation.

### Strategy
- Define global design tokens as CSS custom properties on the root scope.
- Use theme-specific overrides for light and dark modes.
- Organize variables by category: color, typography, spacing, radius, shadow, motion, and layout.
- Reference variables everywhere instead of hardcoding values in components.

### Recommended Variable Groups
- --color-primary-*
- --color-secondary-*
- --color-accent-*
- --color-neutral-*
- --color-success-*
- --color-warning-*
- --color-error-*
- --color-info-*
- --color-surface-*
- --color-background-*
- --color-border-*
- --color-text-*
- --font-*
- --space-*
- --radius-*
- --shadow-*
- --z-*
- --motion-*
- --container-*
- --grid-*

### Usage Guidelines
- Use semantic variables for implementation.
- Keep component styles referencing the same token names across themes.
- Avoid direct hex values in component files.

### Do's
- Do keep variable naming stable.
- Do let variables drive both theme and state styling.
- Do use semantic naming where appropriate.

### Don'ts
- Don't duplicate equivalent values under different names without need.
- Don't hardcode token replacements in component styles.

### Best Practices
- Align CSS variables closely with the design system document.
- Use variables to make future visual updates low risk.

## 6. JavaScript Module Architecture

### Purpose
The JavaScript architecture should support progressive enhancement, modular interaction, and clear feature ownership.

### Recommended Structure
```text
src/scripts/
├── main.js
├── modules/
│   ├── navigation.js
│   ├── animations.js
│   ├── scroll.js
│   ├── theme.js
│   ├── gallery.js
│   ├── counter.js
│   ├── accordion.js
│   ├── carousel.js
│   ├── modal.js
│   ├── tooltip.js
│   ├── form.js
│   └── reveal.js
├── components/
│   ├── header.js
│   ├── footer.js
│   ├── tabs.js
│   ├── filter.js
│   ├── timeline.js
│   ├── stats.js
│   └── cards.js
├── services/
│   ├── analytics.js
│   ├── seo.js
│   └── routing.js
├── data/
│   ├── navigation-data.js
│   ├── content-data.js
│   └── site-config.js
└── utils/
    ├── dom.js
    ├── events.js
    ├── storage.js
    ├── media-query.js
    └── constants.js
```

### Module Responsibilities
- main.js: entry point that initializes page behavior.
- modules/: reusable interaction features.
- components/: UI behavior tied to shared components.
- services/: cross-cutting concerns such as analytics and metadata helpers.
- data/: structured data for navigation, pages, and content.
- utils/: small helper functions used across modules.

### Usage Guidelines
- Keep modules single-purpose.
- Export small, composable functions.
- Initialize only the modules relevant to the current page.
- Avoid tightly coupling UI behavior to markup assumptions.

### Do's
- Do make each module independently testable.
- Do use event delegation where practical.
- Do support page-level initialization based on data attributes or page identifiers.

### Don'ts
- Don't create one large script file.
- Don't duplicate shared logic across modules.
- Don't entangle animation, state, and DOM setup in one place.

### Best Practices
- Use explicit dependencies and predictable naming.
- Keep module initialization lightweight.
- Favor enhancement over hard dependency on JavaScript for core content.

## 7. Component Architecture

### Purpose
The component architecture defines how reusable interface blocks are composed across the site.

### Component Layers
- Primitives: buttons, inputs, badges, tags, icons, typography wrappers.
- Composite components: cards, accordions, modals, galleries, stats, testimonials.
- Section components: hero, feature grids, proof bands, CTAs, footer sections.
- Page compositions: page-specific assemblies built from shared parts.

### Usage Guidelines
- Build from smallest reusable unit upward.
- Keep components purpose-driven and composable.
- Prefer variants over duplicate components.

### Do's
- Do reuse the same card, badge, and CTA patterns across pages.
- Do keep component APIs or data models simple.
- Do build sections from shared primitives.

### Don'ts
- Don't create page-only versions of generic UI.
- Don't create components that differ only by minor styling.
- Don't let components depend on a single page's content shape.

### Best Practices
- Design every component for reuse from the start.
- Keep component responsibilities narrow.
- Create components that can evolve with future content types.

## 8. Asset Organization

### Purpose
Asset organization ensures media is predictable, optimized, and easy to maintain.

### Structure
- src/assets/images/: source-managed images.
- src/assets/illustrations/: original illustrations or vector assets.
- src/assets/icons/: local icon assets if needed.
- src/assets/fonts/: local font files.
- public/: stable static files that should be copied verbatim.

### Usage Guidelines
- Keep source assets in src/ unless they must remain static as-is.
- Optimize asset formats before committing them.
- Group assets by type and usage.

### Do's
- Do name assets descriptively.
- Do keep source and output assets separate.
- Do use versioned replacement for old assets when needed.

### Don'ts
- Don't place random files in the root.
- Don't mix source assets with build artifacts.

### Best Practices
- Maintain an asset inventory as the library grows.
- Use stable naming and folder conventions.

## 9. Image Strategy

### Purpose
The image strategy defines how HackUnion visual content should be selected, stored, optimized, and used.

### Strategy
- Favor authentic, high-quality community photography.
- Use project and experience imagery to show real builder activity.
- Keep image crops intentional and consistent.
- Avoid stock imagery unless no better option exists.

### Usage Guidelines
- Use images to support credibility and emotion.
- Match aspect ratios to component templates.
- Use descriptive filenames and metadata.

### Do's
- Do use original or carefully curated imagery.
- Do compress and resize images for web delivery.
- Do support responsive image delivery.

### Don'ts
- Don't overload pages with oversized media.
- Don't use generic, staged, or irrelevant visuals.
- Don't let imagery distract from the message.

### Best Practices
- Use images as proof, not decoration.
- Keep visual tone consistent across the site.

## 10. Icon Strategy

### Purpose
Icons support scanning, clarity, and hierarchy.

### Strategy
- Use Lucide Icons as the primary icon source.
- Keep stroke style and sizing consistent.
- Use icons functionally, not decoratively.

### Usage Guidelines
- Use icons for navigation, actions, metadata, state, and light emphasis.
- Avoid mixing icon families.
- Keep icon use minimal where text already communicates clearly.

### Do's
- Do use Lucide as the default icon set.
- Do keep icons aligned to text and controls.
- Do ensure icons remain legible at small sizes.

### Don'ts
- Don't combine different icon styles in the same UI.
- Don't use icons as unnecessary ornament.

### Best Practices
- Use icons to reduce cognitive load.
- Treat icons as part of the system, not a decorative layer.

## 11. Font Strategy

### Purpose
The font strategy defines the typographic implementation approach behind the design system.

### Strategy
- Use a modern, highly legible sans-serif for UI and editorial content.
- Use a mono font only for technical labels, code-like strings, or structured technical data.
- Load fonts efficiently to avoid layout shift.
- Prefer self-hosted or well-managed web font delivery.

### Usage Guidelines
- Use only the font families required by the design system.
- Keep font weights limited to the minimum needed for hierarchy.
- Optimize font loading and fallbacks.

### Do's
- Do maintain strong readability.
- Do use font weights intentionally.
- Do keep typography consistent with the design system.

### Don'ts
- Don't introduce unnecessary font families.
- Don't use too many weights or styles.
- Don't sacrifice performance for typographic novelty.

### Best Practices
- Pair typographic clarity with fast loading behavior.
- Keep font choices durable and timeless.

## 12. Animation Architecture

### Purpose
Animation architecture defines how motion is implemented, isolated, and reused across the site.

### Strategy
- Use CSS transitions for simple state changes.
- Use GSAP for meaningful reveals, sequencing, and richer page motion.
- Keep animation modules separate from content and layout logic.
- Trigger animation only when it improves understanding or brand quality.

### Recommended Modules
- animations.js: shared motion orchestration
- reveal.js: scroll-triggered reveals
- counter.js: count-up or stat animation
- carousel.js: timed or interactive content motion
- modal.js: open/close motion

### Usage Guidelines
- Keep motion subtle and purposeful.
- Respect reduced-motion preferences.
- Avoid unnecessary parallax or continuous motion.

### Do's
- Do use GSAP for premium, high-value moments.
- Do keep animations consistent in duration and easing.
- Do use animation to guide attention.

### Don'ts
- Don't animate every component.
- Don't create motion that competes with content.
- Don't rely on animation for core meaning.

### Best Practices
- Use animation to reinforce hierarchy.
- Keep interactions smooth and lightweight.

## 13. Scroll Behavior

### Purpose
Scroll behavior should feel natural, stable, and responsive.

### Strategy
- Use Lenis only where enhanced smooth scrolling supports the experience.
- Preserve native-like scrolling behavior and accessibility.
- Avoid scroll hijacking.

### Usage Guidelines
- Apply smooth scrolling carefully.
- Disable or reduce enhancement when it harms usability.

### Do's
- Do keep scroll motion subtle.
- Do maintain control for the user.

### Don'ts
- Don't create disorienting scroll physics.
- Don't interfere with browser navigation expectations.

### Best Practices
- Treat scroll enhancements as optional polish, not core behavior.
- Test scroll feel on real devices.

## 14. Responsive Strategy

### Purpose
Responsive strategy ensures the site performs and reads well across all target devices.

### Approach
- Design mobile-first.
- Scale layout, spacing, and hierarchy as screens grow.
- Reorder sections only when necessary for usability.

### Usage Guidelines
- Keep touch targets generous.
- Preserve reading comfort and visual hierarchy on mobile.
- Avoid dense multi-column layouts on smaller screens.

### Do's
- Do adapt layout thoughtfully at each breakpoint.
- Do keep nav, CTAs, and forms easy to use on mobile.

### Don'ts
- Don't shrink desktop designs into mobile proportions.
- Don't assume hover or precise cursor control.

### Best Practices
- Validate behavior on actual device widths.
- Keep the content model identical even if the presentation adapts.

## 15. Breakpoints

### Purpose
Breakpoints define when layout and spacing behavior should adapt.

### Recommended Breakpoints
- xs: 360px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Usage Guidelines
- Use breakpoints as layout thresholds, not style excuses.
- Keep breakpoint adjustments coordinated across typography, grid, and spacing.

### Do's
- Do use the same breakpoint language across SCSS and JS if needed.
- Do keep responsive changes consistent.

### Don'ts
- Don't invent component-specific breakpoint systems.
- Don't over-fragment responsive rules.

### Best Practices
- Keep breakpoint behavior documented and predictable.
- Use the fewest breakpoints needed to preserve quality.

## 16. Utility Classes

### Purpose
Utility classes provide small, reusable helpers for layout, spacing, visibility, and state.

### Strategy
- Keep utilities limited and intentional.
- Use them for common one-off needs that would otherwise cause duplication.
- Avoid building a utility framework.

### Recommended Utility Types
- Spacing helpers
- Text alignment helpers
- Display helpers
- Visibility helpers
- Flex helpers
- Flow or stack helpers
- State helpers
- Screen-reader-only helpers

### Usage Guidelines
- Use utilities for predictable small adjustments.
- Keep them generic and safe.

### Do's
- Do keep utility names simple.
- Do use utilities to reduce repeated declarations.

### Don'ts
- Don't let utilities replace component styling entirely.
- Don't create endless edge-case helpers.

### Best Practices
- Use utilities as support, not as the main styling architecture.
- Keep them stable and easy to understand.

## 17. Naming Convention

### Purpose
Naming conventions support maintainability, consistency, and team clarity.

### Strategy
- Use lowercase, hyphenated names for files and folders.
- Use semantic, purpose-driven names for components and modules.
- Keep naming consistent across SCSS, JavaScript, HTML, and assets.

### Usage Guidelines
- Use clear names that describe function or content.
- Avoid ambiguous or trendy naming.

### Do's
- Do keep names descriptive and stable.
- Do prefer one naming pattern across the codebase.

### Don'ts
- Don't use vague abbreviations.
- Don't rename foundational concepts without good reason.

### Best Practices
- Let the architecture remain readable to both designers and engineers.
- Favor names that survive future expansion.

## 18. File Naming Convention

### Purpose
File naming conventions support searchability and predictable imports.

### Rules
- Use lowercase hyphenated file names.
- Use partial prefixes in SCSS where conventional.
- Use descriptive module names for JavaScript.
- Keep HTML filenames aligned with route or page names.

### Examples of File Naming Style
- home.html
- about.html
- main.scss
- navigation.js
- site-config.js
- _buttons.scss
- _light.scss

### Usage Guidelines
- Keep file names short but specific.
- Use the same root term for related files and folders.

### Do's
- Do keep file naming consistent across the project.
- Do use partial conventions where they add clarity.

### Don'ts
- Don't mix naming styles within one area.
- Don't use uppercase or spaces in file names.

### Best Practices
- Make file names easy to scan in editors and build tools.
- Align file names with the information architecture and component model.

## 19. SEO Strategy

### Purpose
The SEO strategy ensures the static site is discoverable, indexable, and semantically strong.

### Strategy
- Use unique title tags and meta descriptions for every page.
- Keep headings semantically structured.
- Produce crawlable HTML content for all important pages.
- Use internal linking deliberately.
- Build content around builder-first and community intent.

### Usage Guidelines
- Keep page-level copy aligned with search intent.
- Use clean URLs and descriptive link labels.
- Include metadata in the HTML output for each page.

### Do's
- Do prioritize semantic content structure.
- Do use internal links to connect related content.
- Do support image alt text and structured media metadata.

### Don'ts
- Don't hide important content behind JavaScript-only interactions.
- Don't duplicate page titles or meta descriptions.
- Don't use vague copy for SEO-critical pages.

### Best Practices
- Treat every page as a search landing page where appropriate.
- Write for humans first, but structure for crawlers correctly.

## 20. robots.txt Strategy

### Purpose
robots.txt controls crawler access and supports safe indexing behavior.

### Strategy
- Allow indexing of public pages.
- Block non-public or low-value technical paths if any exist later.
- Reference the sitemap location.

### Usage Guidelines
- Keep robots.txt simple and explicit.
- Update it only when site structure changes.

### Do's
- Do expose the sitemap location.
- Do prevent accidental crawling of sensitive or irrelevant paths if needed.

### Don'ts
- Don't block important public pages.
- Don't create overly complex crawl rules.

### Best Practices
- Keep crawler instructions minimal and maintainable.
- Align robots settings with the public content strategy.

## 21. sitemap.xml Strategy

### Purpose
sitemap.xml helps search engines discover the site structure efficiently.

### Strategy
- Include all indexable public pages.
- Keep URLs current and canonical.
- Update the sitemap when routes change.

### Usage Guidelines
- Include homepage, primary pages, policy pages, and any future detail pages that should be indexed.
- Exclude utility or non-indexable pages if necessary.

### Do's
- Do keep the sitemap accurate.
- Do reflect the final public URL structure.

### Don'ts
- Don't include duplicate or non-canonical URLs.
- Don't let the sitemap drift from the actual site.

### Best Practices
- Regenerate or update the sitemap as part of deployment.
- Keep it simple and deterministic.

## 22. Open Graph Strategy

### Purpose
Open Graph metadata improves sharing quality on social platforms and messaging apps.

### Strategy
- Define unique title, description, and image metadata for each key page.
- Use brand-consistent preview imagery.
- Support a coherent visual identity in shared links.

### Usage Guidelines
- Use a clean, recognizable OG image system.
- Keep social copy concise and specific.

### Do's
- Do provide page-specific Open Graph data.
- Do include Twitter card metadata if supported.

### Don'ts
- Don't reuse one generic social preview for every page.
- Don't omit alt text and image context where supported.

### Best Practices
- Make shared links look intentional and premium.
- Keep OG assets optimized for size and readability.

## 23. Structured Data Strategy

### Purpose
Structured data helps search engines understand the site and its content types.

### Strategy
- Add relevant schema where it fits the content.
- Use organization, website, breadcrumb, article, event, and FAQ schema as appropriate.
- Keep schema aligned with visible content.

### Usage Guidelines
- Use structured data only when the underlying content truly supports it.
- Keep markup valid and current.

### Do's
- Do apply organization and website schema site-wide if appropriate.
- Do use article schema for blog content.
- Do use event schema for event pages when present.

### Don'ts
- Don't mark up content that is not visible.
- Don't over-apply schema types that do not fit.

### Best Practices
- Use structured data to reinforce the real content model.
- Maintain schema as content evolves.

## 24. Accessibility Strategy

### Purpose
Accessibility must be built into the technical architecture, not added later.

### Strategy
- Use semantic HTML.
- Support keyboard navigation everywhere.
- Ensure focus visibility and logical order.
- Provide meaningful alt text.
- Respect reduced-motion preferences.
- Keep form labels and error states explicit.

### Usage Guidelines
- Build components with accessibility in mind from the start.
- Test states, not just default views.

### Do's
- Do make interactions usable without a mouse.
- Do maintain contrast and readable type.
- Do provide accessible fallbacks for motion and media.

### Don'ts
- Don't rely on color alone.
- Don't make content accessible only through JavaScript behaviors.

### Best Practices
- Treat accessibility as part of quality, not compliance alone.
- Verify accessibility in both light and dark modes.

## 25. Performance Strategy

### Purpose
Performance strategy ensures the site feels fast, responsive, and lightweight.

### Strategy
- Minimize JavaScript.
- Keep CSS lean and token-driven.
- Optimize images and font delivery.
- Load enhancements only where needed.
- Avoid heavy third-party dependencies.

### Usage Guidelines
- Prefer native browser features first.
- Add only the JavaScript required for enhanced interactions.

### Do's
- Do use progressive enhancement.
- Do defer non-essential scripts.
- Do prioritize content visibility and interaction speed.

### Don'ts
- Don't ship unnecessary libraries.
- Don't let animation or scroll enhancements hurt runtime performance.

### Best Practices
- Measure performance from the start.
- Keep the default experience usable even before enhancements load.

## 26. Lazy Loading Strategy

### Purpose
Lazy loading reduces initial payload and improves perceived performance.

### Strategy
- Lazy load below-the-fold images and media.
- Defer non-critical JavaScript modules.
- Load page-specific interactions only on pages that need them.

### Usage Guidelines
- Use eager loading only for above-the-fold critical media.
- Balance laziness with crawlability and accessibility.

### Do's
- Do prioritize hero assets and critical content.
- Do lazy load content that is not immediately needed.

### Don'ts
- Don't lazy load content that is essential for first interaction.
- Don't create layout shifts when media loads.

### Best Practices
- Pair lazy loading with placeholders or aspect ratio reservation.
- Keep loading behavior predictable.

## 27. Image Optimization Strategy

### Purpose
Image optimization reduces bandwidth usage and improves visual quality across devices.

### Strategy
- Resize images to appropriate breakpoints.
- Compress assets before deployment.
- Use modern formats where supported.
- Provide responsive variants where needed.
- Preserve aspect ratios and composition.

### Usage Guidelines
- Choose file formats based on content type.
- Reserve high-resolution sources only where necessary.

### Do's
- Do compress aggressively without visible degradation.
- Do use source images that are already well composed.
- Do provide dimensions to avoid layout shift.

### Don'ts
- Don't upload oversized originals to production.
- Don't rely on one image size for all screens.

### Best Practices
- Keep a disciplined image pipeline.
- Use imagery to support storytelling while protecting performance.

## 28. Browser Compatibility Strategy

### Purpose
Browser compatibility ensures the site works reliably for the intended audience.

### Strategy
- Support modern evergreen browsers.
- Provide graceful degradation for unsupported enhancements.
- Avoid reliance on experimental behavior.

### Target Compatibility
- Latest versions of Chrome, Edge, Safari, and Firefox
- Current mobile Safari and Chrome on Android

### Usage Guidelines
- Prefer standards-based HTML, CSS, and JavaScript.
- Test critical flows in the primary modern browsers.

### Do's
- Do use well-supported features.
- Do verify layout, motion, and navigation across browser families.

### Don'ts
- Don't depend on one browser's proprietary behavior.
- Don't use fragile edge-case APIs for core functionality.

### Best Practices
- Keep enhancement layers optional and resilient.
- Test both graceful fallback and enhanced behavior.

## 29. GitHub Pages Deployment Strategy

### Purpose
GitHub Pages deployment provides a simple, reliable static hosting model.

### Strategy
- Build the site with Vite into a deployable static output.
- Publish the generated build directory to GitHub Pages.
- Keep deployment reproducible and automated.

### Usage Guidelines
- Ensure asset paths work with the GitHub Pages base path if the project is served from a repository subpath.
- Verify that routes resolve correctly in a static hosting environment.
- Use a 404 page that gracefully recovers users.

### Do's
- Do confirm relative or configured base paths before release.
- Do include all public assets in the build output.
- Do keep the deployment pipeline deterministic.

### Don'ts
- Don't assume root deployment without checking repository hosting details.
- Don't rely on server-side routing.

### Best Practices
- Test the production build locally before publishing.
- Keep the deploy process simple enough to repeat confidently.

## 30. Build Process

### Purpose
The build process converts the source project into optimized static assets for deployment.

### Recommended Flow
1. Install dependencies.
2. Run local development server.
3. Lint or validate source files if configured.
4. Build optimized production assets with Vite.
5. Preview the production output locally.
6. Deploy the build output to GitHub Pages.

### Usage Guidelines
- Keep development and production output aligned.
- Validate asset paths and page entry points before deployment.

### Do's
- Do use repeatable build steps.
- Do validate the final output before publishing.

### Don'ts
- Don't publish unverified builds.
- Don't rely on manual file copying.

### Best Practices
- Make the build pipeline easy to understand and maintain.
- Keep deployment artifacts clean and reproducible.

## 31. Code Organization Rules

### Purpose
Code organization rules define how the project should stay readable and maintainable over time.

### Rules
- One responsibility per file or module.
- Shared logic lives in shared modules.
- Page-specific logic stays page-specific.
- Style tokens live in the architecture layer, not inside components.
- Data should be structured and centralized when reused.

### Usage Guidelines
- Keep imports organized and minimal.
- Use predictable naming and file placement.
- Avoid circular dependencies.

### Do's
- Do isolate concerns cleanly.
- Do prefer composition and reuse.
- Do keep modules small and understandable.

### Don'ts
- Don't blur the lines between layout, behavior, and content.
- Don't create special-case files for trivial differences.

### Best Practices
- Make the codebase easy to navigate for future contributors.
- Keep structure more important than convenience.

## 32. Reusable Components Strategy

### Purpose
Reusable components reduce duplication and ensure consistency across the site.

### Strategy
- Build shared primitives first.
- Compose sections from those primitives.
- Use data-driven content where possible.
- Keep component variations controlled through explicit options.

### Usage Guidelines
- Reuse buttons, cards, badges, section headers, and CTA patterns across pages.
- Avoid cloning entire sections for minor changes.

### Do's
- Do create components that work across multiple pages.
- Do use the same interaction patterns repeatedly.

### Don'ts
- Don't duplicate card or CTA logic for each page.
- Don't create one-off design exceptions without a strong reason.

### Best Practices
- Treat reusable components as product infrastructure.
- Keep the shared system small, understandable, and extensible.

## 33. Future Scalability Strategy

### Purpose
Future scalability ensures the project can grow into new pages, content types, and experiences without rethinking its foundation.

### Strategy
- Build around reusable templates.
- Keep the architecture data-driven where useful.
- Leave room for future content types such as team, FAQ, press, project detail pages, and event detail pages.
- Make the navigation and file structure able to absorb new sections without disruption.

### Usage Guidelines
- Add new modules only when repeatable needs appear.
- Extend existing patterns before introducing new ones.
- Keep the sitemap and build structure in sync.

### Do's
- Do design for content growth.
- Do keep the architecture flexible but disciplined.
- Do support future CMS or data-source integration if required later.

### Don'ts
- Don't create architectural dead ends.
- Don't bake page-specific assumptions into shared modules.
- Don't let temporary choices become permanent constraints.

### Best Practices
- Preserve a strong core system and extend around it.
- Keep the architecture simple enough to scale without becoming fragile.

## 34. Output and Delivery Rules
- Keep the project static and deployment-friendly.
- Avoid framework-specific assumptions.
- Make public-facing pages discoverable and crawlable.
- Keep JavaScript enhancements optional and modular.
- Keep styling token-driven and maintainable.
- Ensure every page can be supported by the same architecture model.

## Closing Standard
HackUnion v2 should be engineered as a clean, modern static product with strong technical discipline. The architecture must support a premium builder-first brand while remaining fast, accessible, searchable, and easy to grow.
