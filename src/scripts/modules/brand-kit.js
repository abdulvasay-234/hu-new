import { showToast } from './toasts.js';

const fallbackCopy = (value) => {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', 'true');
  area.style.position = 'absolute';
  area.style.left = '-9999px';

  document.body.appendChild(area);
  area.select();

  try {
    const copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  } catch (_error) {
    document.body.removeChild(area);
    return false;
  }
};

const copyText = async (value) => {
  if (!value) {
    return false;
  }

  if (!navigator.clipboard || !window.isSecureContext) {
    return fallbackCopy(value);
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (_error) {
    return fallbackCopy(value);
  }
};

export const initBrandKit = () => {
  const copyButtons = Array.from(document.querySelectorAll('[data-copy-hex]'));

  if (!copyButtons.length) {
    return;
  }

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const hex = button.getAttribute('data-copy-hex');
      const copied = await copyText(hex ?? '');

      if (copied) {
        showToast({
          title: 'HEX copied',
          message: `${hex} copied to clipboard.`,
          tone: 'success',
          duration: 2600
        });
        return;
      }

      showToast({
        title: 'Copy failed',
        message: 'Copying to clipboard is unavailable. Please copy manually.',
        tone: 'warning',
        duration: 3000
      });
    });
  });
};
