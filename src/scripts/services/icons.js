let createIconsFn;
let iconSet;

const toPascalCase = (value) => String(value)
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const loadIconRenderer = async () => {
  if (createIconsFn && iconSet) {
    return;
  }

  const [{ createIcons }, { lucideIcons }] = await Promise.all([
    import('lucide'),
    import('../data/lucide-icons.js')
  ]);

  createIconsFn = createIcons;
  iconSet = Object.fromEntries(
    Object.entries(lucideIcons).map(([name, icon]) => [toPascalCase(name), icon])
  );
};

export const renderLucideIcons = async () => {
  if (!document.querySelector('[data-lucide]')) {
    return;
  }

  await loadIconRenderer();
  createIconsFn({ icons: iconSet });
};
