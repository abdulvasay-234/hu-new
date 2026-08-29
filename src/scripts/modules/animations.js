import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';

export const initAnimations = (page = 'shared') => {
  const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
  const staggerGroups = Array.from(document.querySelectorAll('[data-stagger]'));
  const root = document.body;

  const isVisibleInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visiblePixels = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const intersectionRatio = visiblePixels / Math.max(rect.height, 1);

    return visiblePixels > 0 && intersectionRatio >= 0.01;
  };

  if (page === 'shared') {
    root.classList.remove('is-page-entering');
    root.classList.add('is-page-ready');
  }

  const revealElement = (element) => {
    element.classList.add('is-revealed');
  };

  const revealGroup = (group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty('--stagger-index', String(index));
    });
    group.classList.add('is-revealed');
  };

  const revealVisiblePending = () => {
    animatedElements.forEach((element) => {
      if (!element.classList.contains('is-revealed') && isVisibleInViewport(element)) {
        revealElement(element);
      }
    });

    staggerGroups.forEach((group) => {
      if (!group.classList.contains('is-revealed') && isVisibleInViewport(group)) {
        revealGroup(group);
      }
    });
  };

  if (prefersReducedMotion()) {
    animatedElements.forEach(revealElement);
    staggerGroups.forEach(revealGroup);
    return;
  }

  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty('--stagger-index', String(index));
    });
  });

  const observer = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      if (entry.target.hasAttribute('data-stagger')) {
        revealGroup(entry.target);
      } else {
        revealElement(entry.target);
      }

      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.01,
    rootMargin: '0px 0px -5% 0px'
  });

  if (!observer) {
    animatedElements.forEach(revealElement);
    staggerGroups.forEach(revealGroup);
    return;
  }

  animatedElements.forEach((element) => observer.observe(element));
  staggerGroups.forEach((group) => observer.observe(group));

  // Guard against mobile/tall-section observer misses by force-revealing visible targets.
  revealVisiblePending();
  window.addEventListener('load', revealVisiblePending, { once: true });
  window.addEventListener('resize', revealVisiblePending, { passive: true });
  window.setTimeout(revealVisiblePending, 900);
};
