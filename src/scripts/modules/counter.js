export const initCounter = () => {
  const counters = document.querySelectorAll('[data-counter], [data-counter-target]');

  const animateCounter = (counter) => {
    const rawTarget = counter.dataset.counterTarget ?? counter.dataset.counter ?? counter.textContent ?? '0';
    const numericTarget = Number(String(rawTarget).replace(/[^0-9.-]/g, ''));
    const prefix = counter.dataset.counterPrefix ?? '';
    const suffix = counter.dataset.counterSuffix ?? '';

    if (!Number.isFinite(numericTarget)) {
      return;
    }

    if (counter.dataset.counterAnimated === 'true') {
      counter.textContent = `${prefix}${numericTarget}${suffix}`;
      return;
    }

    counter.dataset.counterAnimated = 'true';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counter.textContent = `${prefix}${numericTarget}${suffix}`;
      return;
    }

    const duration = Number(counter.dataset.counterDuration ?? 1200);
    const startTime = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(numericTarget * eased);
      counter.textContent = `${prefix}${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const revealAll = () => counters.forEach((counter) => animateCounter(counter));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.4,
    rootMargin: '0px 0px -10% 0px'
  });

  counters.forEach((counter) => observer.observe(counter));
};
