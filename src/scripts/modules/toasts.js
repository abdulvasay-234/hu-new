const TOAST_STACK_ATTRIBUTE = 'data-toast-stack';

const ensureToastStack = () => {
  let stack = document.querySelector(`[${TOAST_STACK_ATTRIBUTE}]`);

  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute(TOAST_STACK_ATTRIBUTE, 'true');
    stack.setAttribute('aria-live', 'polite');
    stack.setAttribute('aria-atomic', 'true');
    document.body.appendChild(stack);
  }

  return stack;
};

export const showToast = ({ title, message, tone = 'info', duration = 3600 } = {}) => {
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = `toast toast--${tone}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <strong class="toast__title">${title ?? 'Notice'}</strong>
    <div class="toast__message">${message ?? ''}</div>
  `;

  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    window.setTimeout(() => toast.remove(), 220);
  }, duration);
};

export const initToasts = () => {
  document.querySelectorAll('[data-toast-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      showToast({
        title: trigger.getAttribute('data-toast-title') ?? 'Component action',
        message: trigger.getAttribute('data-toast-message') ?? 'Toast system is ready.',
        tone: trigger.getAttribute('data-toast-tone') ?? 'info'
      });
    });
  });
};