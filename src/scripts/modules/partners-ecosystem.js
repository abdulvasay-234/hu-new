import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import { partnerCategories, partnerLogos } from '../data/partners-ecosystem-data.js';

const ALL_LOGOS_FILTER = 'all';

const categoryOrder = new Map(partnerCategories.map((category, index) => [category, index]));

const sortPartnerLogos = (logos) => {
  return [...logos].sort((first, second) => {
    const firstCategoryIndex = categoryOrder.get(first.category) ?? Number.MAX_SAFE_INTEGER;
    const secondCategoryIndex = categoryOrder.get(second.category) ?? Number.MAX_SAFE_INTEGER;

    if (firstCategoryIndex !== secondCategoryIndex) {
      return firstCategoryIndex - secondCategoryIndex;
    }

    return first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });
  });
};

const renderCategory = (category, index, isActive = false) => `
  <button
    type="button"
    class="partners__category${isActive ? ' is-active' : ''}"
    style="--partner-delay: ${index * 80}ms"
    data-partner-filter="${category}"
    aria-pressed="${isActive ? 'true' : 'false'}"
  >
    ${category === ALL_LOGOS_FILTER ? 'ALL' : category.toUpperCase()}
  </button>
`;

const renderPartnerCard = (logo) => {
  const logoUrl = typeof logo.url === 'string' ? logo.url.trim() : '';
  const cardTag = logoUrl ? 'a' : 'article';
  const cardAttributes = logoUrl
    ? `class="partners__logo-card partners__logo-card-link" href="${logoUrl}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${logo.name}"`
    : `class="partners__logo-card" aria-label="${logo.name} in ${logo.category}"`;

  return `
    <li class="partners__logo-item">
      <${cardTag} ${cardAttributes}>
        <div class="partners__logo-visual" aria-hidden="true">
          <img class="partners__logo-mark" src="${logo.logoPath}" alt="${logo.alt || `${logo.name} logo`}" loading="lazy" decoding="async" />
        </div>
        <strong class="partners__logo-name">${logo.name}</strong>
      </${cardTag}>
    </li>
  `;
};

const renderCategoryGroup = (category, logos, index) => {
  const railId = `partners-rail-${category.toLowerCase().replace(/\s+/g, '-')}`;

  return `
    <section class="partners__group" style="--partner-delay: ${index * 110}ms" data-partner-category-group="${category}" aria-labelledby="${railId}-label">
      <h3 id="${railId}-label" class="partners__group-title">${category}</h3>
      <div class="partners__rail" data-partner-rail>
        <button
          type="button"
          class="partners__rail-control partners__rail-control--left"
          data-partner-rail-control="left"
          aria-label="Scroll ${category.toLowerCase()} left"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div class="partners__rail-viewport" data-partner-rail-viewport tabindex="0" aria-label="${category} partner rail">
          <ul id="${railId}" class="partners__rail-track" aria-label="${category}">
            ${logos.map((logo) => renderPartnerCard(logo)).join('')}
          </ul>
        </div>
        <button
          type="button"
          class="partners__rail-control partners__rail-control--right"
          data-partner-rail-control="right"
          aria-label="Scroll ${category.toLowerCase()} right"
        >
          <span aria-hidden="true">→</span>
        </button>
        <span class="partners__rail-fade" aria-hidden="true"></span>
      </div>
    </section>
  `;
};

const getGroupedLogos = (logos) => {
  const groupedLogos = new Map(partnerCategories.map((category) => [category, []]));

  logos.forEach((logo) => {
    if (!groupedLogos.has(logo.category)) {
      groupedLogos.set(logo.category, []);
    }

    groupedLogos.get(logo.category)?.push(logo);
  });

  partnerCategories.forEach((category) => {
    const categoryLogos = groupedLogos.get(category) || [];
    categoryLogos.sort((first, second) => first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }));
    groupedLogos.set(category, categoryLogos);
  });

  return groupedLogos;
};

export const initPartnersEcosystem = () => {
  const section = document.querySelector('[data-partners-section]');

  if (!section) {
    return;
  }

  const categoryTarget = section.querySelector('[data-partner-categories]');
  const logoGridTarget = section.querySelector('[data-partner-logo-grid]');
  const orderedPartnerLogos = sortPartnerLogos(partnerLogos);
  const groupedLogos = getGroupedLogos(orderedPartnerLogos);

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
    logoGridTarget.innerHTML = partnerCategories
      .map((category, index) => renderCategoryGroup(category, groupedLogos.get(category) || [], index))
      .join('');
  }

  const categoryButtons = Array.from(section.querySelectorAll('[data-partner-filter]'));
  const categoryGroups = Array.from(section.querySelectorAll('[data-partner-category-group]'));
  const railElements = Array.from(section.querySelectorAll('[data-partner-rail]'));

  const setFilter = (filterValue) => {
    const normalizedFilter = filterValue || ALL_LOGOS_FILTER;

    categoryButtons.forEach((button) => {
      const isActive = button.dataset.partnerFilter === normalizedFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    categoryGroups.forEach((group) => {
      const groupCategory = group.dataset.partnerCategoryGroup;
      const showGroup = normalizedFilter === ALL_LOGOS_FILTER || groupCategory === normalizedFilter;

      group.classList.toggle('is-filtered-out', !showGroup);
      group.setAttribute('aria-hidden', showGroup ? 'false' : 'true');
    });
  };

  const setupRail = (railElement) => {
    const viewport = railElement.querySelector('[data-partner-rail-viewport]');
    const leftControl = railElement.querySelector('[data-partner-rail-control="left"]');
    const rightControl = railElement.querySelector('[data-partner-rail-control="right"]');

    if (!viewport || !leftControl || !rightControl) {
      return;
    }

    const updateRailState = () => {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const hasOverflow = maxScrollLeft > 1;
      const nearStart = viewport.scrollLeft <= 2;
      const nearEnd = viewport.scrollLeft >= maxScrollLeft - 2;

      railElement.classList.toggle('is-overflowing', hasOverflow);
      railElement.classList.toggle('is-at-start', nearStart);
      railElement.classList.toggle('is-at-end', nearEnd);

      leftControl.disabled = !hasOverflow || nearStart;
      rightControl.disabled = !hasOverflow || nearEnd;
    };

    const scrollRail = (direction) => {
      const delta = Math.round(viewport.clientWidth * 0.8) * direction;

      viewport.scrollBy({
        left: delta,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    };

    leftControl.addEventListener('click', () => {
      scrollRail(-1);
    });

    rightControl.addEventListener('click', () => {
      scrollRail(1);
    });

    viewport.addEventListener('scroll', updateRailState, { passive: true });

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollRail(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollRail(1);
      }

      if (event.key === 'Home') {
        event.preventDefault();
        viewport.scrollTo({ left: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }

      if (event.key === 'End') {
        event.preventDefault();
        viewport.scrollTo({ left: viewport.scrollWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });

    window.addEventListener('resize', updateRailState);
    updateRailState();
  };

  railElements.forEach(setupRail);

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