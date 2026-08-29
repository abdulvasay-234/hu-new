let createIconsFn;
let iconSet;

const loadIconRenderer = async () => {
  if (createIconsFn && iconSet) {
    return;
  }

  const [{ createIcons }, { lucideIcons }] = await Promise.all([
    import('lucide'),
    import('../data/lucide-icons.js')
  ]);

  createIconsFn = createIcons;
  iconSet = lucideIcons;
};

export const renderLucideIcons = async () => {
  if (!document.querySelector('[data-lucide]')) {
    return;
  }

  await loadIconRenderer();
  createIconsFn({ icons: iconSet });
};
