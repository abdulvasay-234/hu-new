import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';

export const initFinalCta = () => {
  const section = document.querySelector('[data-final-cta-section]');

  if (!section) {
    return;
  }

  const form = section.querySelector('[data-final-cta-form]');
  const statusMessage = section.querySelector('[data-final-cta-status]');

  if (form && statusMessage) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      statusMessage.textContent = 'Newsletter signups need a connected provider before launch. Use Contact Us to request updates for now.';
      statusMessage.classList.add('is-success');
    });
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
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  if (!observer) {
    section.classList.add('is-visible');
    return;
  }

  observer?.observe(section);
};