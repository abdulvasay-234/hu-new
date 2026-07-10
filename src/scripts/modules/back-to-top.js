export const initBackToTop = () => {
  document.querySelectorAll('[data-back-to-top-global]').forEach((button) => {
    const updateVisibility = () => {
      button.classList.toggle('is-visible', window.scrollY > 320);
    };

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  });
};