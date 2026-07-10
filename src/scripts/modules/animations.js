import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';

export const initAnimations = (page = 'shared') => {
  const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
  const staggerGroups = Array.from(document.querySelectorAll('[data-stagger]'));
  const root = document.body;

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
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px'
  });

  if (!observer) {
    animatedElements.forEach(revealElement);
    staggerGroups.forEach(revealGroup);
    return;
  }

  animatedElements.forEach((element) => observer.observe(element));
  staggerGroups.forEach((group) => observer.observe(group));
};
