import { storage } from '../utils/storage.js';

const STORAGE_KEY = 'hackunion-theme';

const getThemeLabel = (theme) => theme === 'dark'
  ? { text: 'Light mode', label: 'Activate light theme', pressed: 'true' }
  : { text: 'Dark mode', label: 'Activate dark theme', pressed: 'false' };

const syncThemeControls = (theme) => {
  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
    const { text, label, pressed } = getThemeLabel(theme);
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-pressed', pressed);

    const textNode = toggle.querySelector('[data-theme-toggle-text]');
    if (textNode) {
      textNode.textContent = text;
    }
  });
};

export const initTheme = () => {
  const savedTheme = storage.get(STORAGE_KEY, 'light');
  document.documentElement.dataset.theme = savedTheme;
  syncThemeControls(savedTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  });
};

export const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  storage.set(STORAGE_KEY, theme);
  syncThemeControls(theme);
};
