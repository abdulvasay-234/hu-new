export const initLazyLoading = () => {
  const images = document.querySelectorAll('img[data-lazy], img[data-src], img[data-reveal-image]');

  const markLoaded = (image) => {
    image.classList.add('is-loaded');
  };

  const applySource = (image) => {
    const nextSrc = image.dataset.src;
    if (nextSrc && image.src !== nextSrc) {
      image.src = nextSrc;
    }
  };

  images.forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
    image.setAttribute('data-reveal-image', 'true');

    if (image.complete) {
      markLoaded(image);
    } else {
      image.addEventListener('load', () => markLoaded(image), { once: true });
    }
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    images.forEach((image) => {
      applySource(image);
      markLoaded(image);
    });
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      applySource(entry.target);
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px 12% 0px'
  });

  images.forEach((image) => observer.observe(image));
};
