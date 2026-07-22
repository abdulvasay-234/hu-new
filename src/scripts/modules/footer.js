import { footerNavigation } from '../data/footer-data.js';

export const initFooter = () => {
  const footer = document.querySelector('[data-site-footer]');

  if (!footer) {
    return;
  }

  const footerList = footer.querySelector('[data-footer-links]');
  const yearNode = footer.querySelector('[data-footer-year]');
  const newsletterForm = footer.querySelector('[data-footer-newsletter-form]');
  const newsletterStatus = footer.querySelector('[data-footer-newsletter-status]');
  const backToTopButton = footer.querySelector('[data-back-to-top]');

  if (footerList) {
    footerList.innerHTML = footerNavigation
      .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
      .join('');
  }

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!newsletterForm.checkValidity()) {
        newsletterForm.reportValidity();
        return;
      }

      newsletterStatus.textContent = 'Newsletter delivery is not connected yet. Use hackunion17@gmail.com for updates until launch wiring is complete.';
      newsletterStatus.classList.add('is-success');
    });
  }

  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};