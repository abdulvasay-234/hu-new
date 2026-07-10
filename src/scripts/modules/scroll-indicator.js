export const initScrollIndicator = () => {
  document.querySelectorAll('[data-scroll-indicator]').forEach((indicator) => {
    const bar = indicator.querySelector('[data-scroll-indicator-bar]');
    if (!bar) {
      return;
    }

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  });
};