import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';

export const initManifesto = () => {
  const section = document.querySelector('[data-manifesto-section]');

  if (!section) {
    return;
  }

  if (prefersReducedMotion()) {
    section.classList.add('is-visible');
    return;
  }

  const observer = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      section.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -10% 0px'
  });

  if (!observer) {
    section.classList.add('is-visible');
    return;
  }

  observer?.observe(section);
};