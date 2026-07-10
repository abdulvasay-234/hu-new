import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import { partnerCategories, partnerLogos } from '../data/partners-ecosystem-data.js';

const ALL_LOGOS_FILTER = 'all';

const renderCategory = (category, index, isActive = false) => `
  <button
    type="button"
    class="partners__category${isActive ? ' is-active' : ''}"
    style="--partner-delay: ${index * 80}ms"
    data-partner-filter="${category}"
    aria-pressed="${isActive ? 'true' : 'false'}"
  >
    ${category}
  </button>
`;

const buildLogoInlineSvg = (logo) => {
  const logoId = logo.shortLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `
    <svg class="partners__logo-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 132" role="img" aria-label="${logo.name} logo mark">
      <defs>
        <linearGradient id="logoPanel-${logoId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#eef2ff" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="408" height="120" rx="22" fill="url(#logoPanel-${logoId})" />
      <rect x="20" y="22" width="88" height="88" rx="20" fill="${logo.brandColor}" />
      <text x="64" y="75" text-anchor="middle" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-size="27" font-weight="700">${logo.shortLabel}</text>
      <path d="M136 48h178" stroke="#cbd5e1" stroke-width="11" stroke-linecap="round" />
      <path d="M136 74h228" stroke="#94a3b8" stroke-width="9" stroke-linecap="round" />
      <path d="M136 96h144" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
    </svg>
  `;
};

const renderLogoCard = (logo, index) => {
  return `
    <li class="partners__logo-item" style="--partner-delay: ${index * 80}ms" data-partner-category="${logo.category}">
      <article class="partners__logo-card" aria-label="${logo.name} in ${logo.category}">
        <span class="partners__logo-category">${logo.category}</span>
        <div class="partners__logo-visual" aria-hidden="true">
          ${buildLogoInlineSvg(logo)}
        </div>
        <strong class="partners__logo-name">${logo.name}</strong>
      </article>
    </li>
  `;
};

export const initPartnersEcosystem = () => {
  const section = document.querySelector('[data-partners-section]');

  if (!section) {
    return;
  }

  const categoryTarget = section.querySelector('[data-partner-categories]');
  const logoGridTarget = section.querySelector('[data-partner-logo-grid]');

  if (categoryTarget) {
    const categoryFilters = [ALL_LOGOS_FILTER, ...partnerCategories];

    categoryTarget.innerHTML = categoryFilters
      .map((category, index) => renderCategory(
        category,
        index,
        category === ALL_LOGOS_FILTER
      ))
      .join('');
  }

  if (logoGridTarget) {
    logoGridTarget.innerHTML = partnerLogos
      .map((logo, index) => renderLogoCard(logo, index))
      .join('');
  }

  const categoryButtons = Array.from(section.querySelectorAll('[data-partner-filter]'));
  const logoItems = Array.from(section.querySelectorAll('.partners__logo-item'));

  const setFilter = (filterValue) => {
    const normalizedFilter = filterValue || ALL_LOGOS_FILTER;

    categoryButtons.forEach((button) => {
      const isActive = button.dataset.partnerFilter === normalizedFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    logoItems.forEach((item) => {
      const itemCategory = item.dataset.partnerCategory;
      const showItem = normalizedFilter === ALL_LOGOS_FILTER || itemCategory === normalizedFilter;

      item.hidden = !showItem;
    });
  };

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.partnerFilter);
    });
  });

  setFilter(ALL_LOGOS_FILTER);

  if (prefersReducedMotion()) {
    section.classList.add('is-visible');
    return;
  }

  const sectionObserver = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      section.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  if (!sectionObserver) {
    section.classList.add('is-visible');
    return;
  }

  sectionObserver?.observe(section);
};