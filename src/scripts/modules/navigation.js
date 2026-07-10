import { primaryNavigation } from '../data/navigation-data.js';

const MOBILE_BREAKPOINT = '(max-width: 1023px)';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

const getFocusableElements = (container) => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
  .filter((element) => !element.hasAttribute('hidden'));

const normalizePath = (path) => {
  const withoutIndex = path.replace(/\/index\.html$/i, '/');
  return withoutIndex.endsWith('/') ? withoutIndex : `${withoutIndex}/`;
};

const resolvePathFromHref = (href) => {
  if (!href || href.startsWith('#')) {
    return null;
  }

  try {
    return normalizePath(new URL(href, window.location.href).pathname);
  } catch {
    return null;
  }
};

export const initNavigation = () => {
  const header = document.querySelector('[data-site-header]');
  const navList = document.querySelector('[data-nav-list]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');
  const mobileMedia = window.matchMedia(MOBILE_BREAKPOINT);

  let lastScrollY = window.scrollY;

  const isMobileViewport = () => mobileMedia.matches;

  const setBodyLock = (locked) => {
    document.body.classList.toggle('is-nav-locked', locked);
  };

  const closeNavigation = ({ restoreFocus = false } = {}) => {
    if (!navToggle || !siteNav) {
      return;
    }

    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    siteNav.removeAttribute('data-open');
    header?.classList.remove('is-menu-open');
    setBodyLock(false);

    if (restoreFocus) {
      navToggle.focus();
    }
  };

  const openNavigation = () => {
    if (!navToggle || !siteNav) {
      return;
    }

    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    siteNav.setAttribute('data-open', 'true');
    header?.classList.add('is-menu-open');
    header?.classList.remove('is-hidden');
    setBodyLock(true);

    const [firstFocusable] = getFocusableElements(siteNav);
    firstFocusable?.focus();
  };

  const toggleNavigation = () => {
    if (!navToggle) {
      return;
    }

    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeNavigation({ restoreFocus: true });
      return;
    }

    openNavigation();
  };

  const handleNavKeydown = (event) => {
    if (!isMobileViewport() || navToggle?.getAttribute('aria-expanded') !== 'true' || !siteNav) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeNavigation({ restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(siteNav);
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    const currentScrollY = window.scrollY;
    const isMenuOpen = header.classList.contains('is-menu-open');

    header.classList.toggle('is-scrolled', currentScrollY > 12);

    if (!isMenuOpen && currentScrollY > lastScrollY + 8 && currentScrollY > 120) {
      header.classList.add('is-hidden');
    }

    if (currentScrollY < lastScrollY - 8 || currentScrollY <= 24 || isMenuOpen) {
      header.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
  };

  const markCurrentNavigationItem = () => {
    if (!siteNav) {
      return;
    }

    const links = Array.from(siteNav.querySelectorAll('.site-nav__list a[href]'));
    if (!links.length) {
      return;
    }

    links.forEach((link) => link.removeAttribute('aria-current'));

    const currentPath = normalizePath(window.location.pathname);
    let currentLink = links.find((link) => resolvePathFromHref(link.getAttribute('href')) === currentPath);

    if (!currentLink && currentPath.includes('/openbuildweek/')) {
      currentLink = links.find((link) => {
        const text = link.textContent?.toLowerCase() ?? '';
        const href = link.getAttribute('href') ?? '';
        return text.includes('openbuild week') || href.includes('openbuildweek');
      });
    }

    if (!currentLink && (currentPath === '/' || currentPath.endsWith('/HU-New/'))) {
      currentLink = links.find((link) => {
        const href = link.getAttribute('href') ?? '';
        return href === './' || href === '../' || href === '.';
      });
    }

    currentLink?.setAttribute('aria-current', 'page');
  };

  if (navList) {
    navList.innerHTML = primaryNavigation
      .map((item) => {
        const linkClasses = ['site-nav__link'];
        if (item.featured) {
          linkClasses.push('site-nav__link--highlight');
        }

        return `<li><a class="${linkClasses.join(' ')}" href="${item.href}">${item.label}</a></li>`;
      })
      .join('');
  }

  markCurrentNavigationItem();

  if (!navToggle || !siteNav) return;

  navToggle.addEventListener('click', toggleNavigation);

  siteNav.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('a[href]') && isMobileViewport()) {
      closeNavigation();
    }
  });

  document.addEventListener('keydown', handleNavKeydown);

  mobileMedia.addEventListener('change', (event) => {
    if (!event.matches) {
      closeNavigation();
    }
  });

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('popstate', markCurrentNavigationItem);
  window.addEventListener('hashchange', markCurrentNavigationItem);
  updateHeaderState();
};
