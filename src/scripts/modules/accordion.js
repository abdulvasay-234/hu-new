export const initAccordion = (root = document) => {
  root.querySelectorAll('[data-accordion-button]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      const group = button.closest('[data-accordion]');

      if (group?.hasAttribute('data-accordion-single')) {
        group.querySelectorAll('[data-accordion-button]').forEach((sibling) => {
          if (sibling === button) {
            return;
          }

          sibling.setAttribute('aria-expanded', 'false');
          const siblingPanel = document.getElementById(sibling.getAttribute('aria-controls'));
          if (siblingPanel) {
            siblingPanel.hidden = true;
          }
        });
      }

      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });

    button.addEventListener('keydown', (event) => {
      const group = button.closest('[data-accordion]');
      if (!group) {
        return;
      }

      const buttons = Array.from(group.querySelectorAll('[data-accordion-button]'));
      const currentIndex = buttons.indexOf(button);
      if (currentIndex === -1) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        buttons[(currentIndex + 1) % buttons.length]?.focus();
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        buttons[(currentIndex - 1 + buttons.length) % buttons.length]?.focus();
      }

      if (event.key === 'Home') {
        event.preventDefault();
        buttons[0]?.focus();
      }

      if (event.key === 'End') {
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
      }
    });
  });
};
