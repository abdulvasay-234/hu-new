import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import { experiencesData } from '../data/experiences-data.js';
import { getSiteRootPath, toSiteHref } from '../utils/site-path.js';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const toneClassMap = {
  cyan: 'experience-card--cyan',
  amber: 'experience-card--amber',
  violet: 'experience-card--violet',
  green: 'experience-card--green'
};

const renderExperienceCard = (experience, index, rootPath) => `
  <article class="card experience-card ${toneClassMap[experience.tone] ?? ''} ${experience.isFlagship ? 'experience-card--flagship' : ''}" style="--experience-delay: ${index * 80}ms" aria-labelledby="${escapeHtml(experience.slug)}-title">
    <div class="experience-card__media">
      <img class="experience-card__media-image" data-src="${escapeHtml(toSiteHref(experience.image, { rootPath }))}" src="${escapeHtml(toSiteHref(experience.image, { rootPath }))}" alt="${escapeHtml(experience.imageAlt || `${experience.title} visual`)}" loading="lazy" decoding="async" />
      <div class="experience-card__media-fill"></div>
      <div class="experience-card__media-copy">
        <span class="experience-card__media-label">${escapeHtml(experience.visualLabel)}</span>
        <span class="experience-card__media-title">${escapeHtml(experience.title)}</span>
      </div>
    </div>

    <div class="experience-card__body">
      <div class="experience-card__badges">
        <span class="badge">${escapeHtml(experience.category)}</span>
        ${experience.isFlagship ? '<span class="experience-status is-open">FLAGSHIP</span>' : ''}
      </div>
      <h3 id="${escapeHtml(experience.slug)}-title">${escapeHtml(experience.title)}</h3>
      <p class="experience-card__description">${escapeHtml(experience.description)}</p>

      <a class="button button--secondary experience-card__cta" href="${escapeHtml(toSiteHref(experience.href, { rootPath }))}" aria-label="${escapeHtml(experience.ctaLabel)} for ${escapeHtml(experience.title)}">
        <span>${escapeHtml(experience.ctaLabel)}</span>
        <span class="experience-card__cta-icon" aria-hidden="true" data-lucide="arrow-right"></span>
      </a>
    </div>
  </article>
`;

export const initExperiences = () => {
  const section = document.querySelector('[data-experiences-section]');
  const rootPath = getSiteRootPath();

  if (!section) {
    return;
  }

  const gridTarget = section.querySelector('[data-experience-grid]');
  const visibleExperiences = experiencesData.filter((experience) => experience.showOnHomepage !== false);

  if (gridTarget) {
    gridTarget.innerHTML = visibleExperiences
      .map((experience, index) => renderExperienceCard(experience, index, rootPath))
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