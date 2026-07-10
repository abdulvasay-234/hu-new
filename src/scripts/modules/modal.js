const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

const getFocusable = (container) => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));

export const initModal = () => {
  let activeModal = null;
  let lastTrigger = null;

  const closeModal = (modal) => {
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
    activeModal = null;
    lastTrigger?.focus();
  };

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(trigger.getAttribute('data-modal-open'));
      if (!target) {
        return;
      }

      target.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-modal-open');
      activeModal = target;
      lastTrigger = trigger;
      getFocusable(target)[0]?.focus();
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      closeModal(trigger.closest('[data-modal]'));
    });
  });

  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.hasAttribute('data-modal-overlay')) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModal) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(activeModal);
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusable(activeModal);
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
};
