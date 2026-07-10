import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import { experiencesData } from '../data/experiences-data.js';

const toneClassMap = {
  cyan: 'experience-card--cyan',
  amber: 'experience-card--amber',
  violet: 'experience-card--violet',
  green: 'experience-card--green'
};

const statusClassMap = {
  'Year Round': 'is-year-round',
  'Registration Open': 'is-open',
  Upcoming: 'is-upcoming',
  'Coming Soon': 'is-soon'
};

const renderHighlights = (highlights) => highlights
  .map((item) => `<li><span data-lucide="circle-check-big" aria-hidden="true"></span><span>${item}</span></li>`)
  .join('');

const renderFeaturedExperience = (experience) => `
  <div class="experience-feature__layout">
    <div class="experience-feature__visual experience-feature__visual--${experience.tone}" aria-hidden="true">
      <img class="experience-feature__visual-image" data-src="${experience.image}" src="${experience.image}" alt="" loading="lazy" decoding="async" />
      <div class="experience-feature__visual-grid"></div>
      <div class="experience-feature__visual-orbit experience-feature__visual-orbit--one"></div>
      <div class="experience-feature__visual-orbit experience-feature__visual-orbit--two"></div>
      <div class="experience-feature__visual-copy">
        <span class="experience-feature__visual-label">${experience.visualLabel}</span>
        <span class="experience-feature__visual-title">${experience.title}</span>
      </div>
    </div>

    <div class="experience-feature__content">
      <div class="experience-feature__badges">
        <span class="badge">${experience.category}</span>
        <span class="experience-status ${statusClassMap[experience.status] ?? ''}">${experience.status}</span>
      </div>
      <h3 id="builders-guild-title">${experience.title}</h3>
      <p class="experience-feature__tagline">${experience.tagline}</p>
      <p class="experience-feature__description">${experience.description}</p>

      <div class="experience-feature__meta">
        <div>
          <span class="experience-feature__meta-label">Audience</span>
          <p>${experience.audience}</p>
        </div>
        <div>
          <span class="experience-feature__meta-label">Highlights</span>
          <ul class="experience-feature__highlights">${renderHighlights(experience.highlights)}</ul>
        </div>
      </div>

      <div class="experience-feature__actions">
        <a class="button button--primary experience-card__cta" href="${experience.href}" aria-label="${experience.ctaLabel} for ${experience.title}">
          <span>${experience.ctaLabel}</span>
          <span class="experience-card__cta-icon" aria-hidden="true" data-lucide="arrow-right"></span>
        </a>
      </div>
    </div>
  </div>
`;

const renderExperienceCard = (experience, index) => `
  <article class="card experience-card ${toneClassMap[experience.tone] ?? ''}" style="--experience-delay: ${index * 80}ms" aria-labelledby="${experience.slug}-title">
    <div class="experience-card__media" aria-hidden="true">
      <img class="experience-card__media-image" data-src="${experience.image}" src="${experience.image}" alt="" loading="lazy" decoding="async" />
      <div class="experience-card__media-fill"></div>
      <div class="experience-card__media-copy">
        <span class="experience-card__media-label">${experience.visualLabel}</span>
        <span class="experience-card__media-title">${experience.title}</span>
      </div>
    </div>

    <div class="experience-card__body">
      <div class="experience-card__badges">
        <span class="badge">${experience.category}</span>
        <span class="experience-status ${statusClassMap[experience.status] ?? ''}">${experience.status}</span>
      </div>
      <h3 id="${experience.slug}-title">${experience.title}</h3>
      <p class="experience-card__tagline">${experience.tagline}</p>
      <p class="experience-card__description">${experience.description}</p>

      <div class="experience-card__meta">
        <div>
          <span class="experience-card__meta-label">Audience</span>
          <p>${experience.audience}</p>
        </div>
        <div>
          <span class="experience-card__meta-label">Highlights</span>
          <ul class="experience-card__highlights">${renderHighlights(experience.highlights.slice(0, 2))}</ul>
        </div>
      </div>

      <a class="button button--secondary experience-card__cta" href="${experience.href}" aria-label="${experience.ctaLabel} for ${experience.title}">
        <span>${experience.ctaLabel}</span>
        <span class="experience-card__cta-icon" aria-hidden="true" data-lucide="arrow-right"></span>
      </a>
    </div>
  </article>
`;

export const initExperiences = () => {
  const section = document.querySelector('[data-experiences-section]');

  if (!section) {
    return;
  }

  const featuredTarget = section.querySelector('[data-experience-featured]');
  const gridTarget = section.querySelector('[data-experience-grid]');
  const [featuredExperience, ...otherExperiences] = experiencesData;

  if (featuredTarget && featuredExperience) {
    featuredTarget.innerHTML = renderFeaturedExperience(featuredExperience);
  }

  if (gridTarget) {
    gridTarget.innerHTML = otherExperiences
      .map((experience, index) => renderExperienceCard(experience, index))
      .join('');
  }

  const revealSection = () => {
    section.classList.add('is-visible');
  };

  if (prefersReducedMotion()) {
    revealSection();
    return;
  }

  const observer = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      revealSection();
      instance.unobserve(entry.target);
    });
  }, {
    // Keep threshold low so long sections still reveal on shorter viewports.
    threshold: 0.05,
    rootMargin: '0px 0px -8% 0px'
  });

  if (!observer) {
    revealSection();
    return;
  }

  observer.observe(section);

  // Safety net: if already in view when initialized, reveal immediately.
  const sectionRect = section.getBoundingClientRect();
  if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
    revealSection();
  }

  // Final fallback for environments where intersection callbacks may not fire reliably.
  window.setTimeout(revealSection, 900);
};