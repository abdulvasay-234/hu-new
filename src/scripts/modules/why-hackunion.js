import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';

const setActiveStep = (section, steps, activeIndex) => {
  steps.forEach((step, index) => {
    const isActive = index === activeIndex;
    const trigger = step.querySelector('[data-why-step-trigger]');

    step.classList.toggle('is-active', isActive);

    if (trigger) {
      if (isActive) {
        trigger.setAttribute('aria-current', 'step');
      } else {
        trigger.removeAttribute('aria-current');
      }
    }
  });

  const denominator = Math.max(steps.length - 1, 1);
  const progressRatio = activeIndex / denominator;
  section.style.setProperty('--why-progress', String(progressRatio));
};

export const initWhyHackUnion = () => {
  const section = document.querySelector('[data-why-hackunion]');

  if (!section) {
    return;
  }

  const steps = Array.from(section.querySelectorAll('[data-why-step]'));

  if (!steps.length) {
    return;
  }

  steps.forEach((step, index) => {
    step.setAttribute('data-why-step-index', String(index));

    const trigger = step.querySelector('[data-why-step-trigger]');

    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', () => {
      setActiveStep(section, steps, index);
    });

    trigger.addEventListener('focus', () => {
      setActiveStep(section, steps, index);
    });
  });

  setActiveStep(section, steps, 0);

  const revealSection = () => {
    section.classList.add('is-visible');
  };

  if (prefersReducedMotion()) {
    revealSection();
    setActiveStep(section, steps, 0);
    return;
  }

  const sectionObserver = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      revealSection();
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  if (sectionObserver) {
    sectionObserver.observe(section);
  } else {
    revealSection();
  }

  section.addEventListener('mouseleave', () => {
    setActiveStep(section, steps, 0);
  });
};
