const EXTERNAL_PROTOCOL_PATTERN = /^(https?:|mailto:|tel:|data:|blob:)/i;

const normalizeRootPath = (rootPath) => {
  if (!rootPath) {
    return './';
  }

  if (rootPath.endsWith('/')) {
    return rootPath;
  }

  return `${rootPath}/`;
};

export const getSiteRootPath = () => {
  const fromBody = document.body?.dataset?.siteRoot;

  if (fromBody) {
    return normalizeRootPath(fromBody);
  }

  const brandLink = document.querySelector('.brand[href]');
  const brandHref = brandLink?.getAttribute('href')?.trim();

  if (brandHref && !brandHref.startsWith('#') && !EXTERNAL_PROTOCOL_PATTERN.test(brandHref)) {
    return normalizeRootPath(brandHref);
  }

  return './';
};

export const toSiteHref = (rawValue, options = {}) => {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return '';
  }

  if (EXTERNAL_PROTOCOL_PATTERN.test(value)) {
    return value;
  }

  const rootPath = normalizeRootPath(options.rootPath || getSiteRootPath());
  const anchorToRoot = options.anchorToRoot !== false;

  if (value.startsWith('#')) {
    return anchorToRoot ? `${rootPath}${value}` : value;
  }

  if (value.startsWith('../')) {
    return value;
  }

  const cleaned = value
    .replace(/^\.\//, '')
    .replace(/^\//, '');

  return `${rootPath}${cleaned}`;
};
