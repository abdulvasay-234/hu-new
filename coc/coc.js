const setLastUpdated = () => {
  const targets = Array.from(document.querySelectorAll('[data-coc-last-updated]'));

  if (!targets.length) {
    return;
  }

  const dateValue = targets[0].getAttribute('data-date') || new Date().toISOString().split('T')[0];
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    targets.forEach((target) => {
      target.textContent = dateValue;
    });
    return;
  }

  const formatted = date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  targets.forEach((target) => {
    target.textContent = formatted;
  });
};

const initReadingProgress = () => {
  const progressBar = document.querySelector('[data-reading-progress]');

  if (!progressBar) {
    return;
  }

  const updateProgress = () => {
    const doc = document.documentElement;
    const maxScrollable = doc.scrollHeight - window.innerHeight;

    if (maxScrollable <= 0) {
      progressBar.style.width = '0%';
      return;
    }

    const progress = Math.min(100, Math.max(0, (window.scrollY / maxScrollable) * 100));
    progressBar.style.width = `${progress.toFixed(2)}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
};

const initScrollTop = () => {
  const button = document.querySelector('[data-scroll-top]');

  if (!button) {
    return;
  }

  const updateVisibility = () => {
    const shouldShow = window.scrollY > 360;
    button.classList.toggle('is-visible', shouldShow);
  };

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
};

const initSectionDecorators = () => {
  const iconMap = {
    tldr: 'sparkles',
    pledge: 'handshake',
    standards: 'scale',
    responsibilities: 'shield-check',
    scope: 'globe',
    reporting: 'flag',
    help: 'life-buoy',
    enforcement: 'gavel',
    faq: 'circle-help',
    attribution: 'scroll-text'
  };

  const sections = Array.from(document.querySelectorAll('main section[id]'));

  sections.forEach((section) => {
    const id = section.id;
    const eyebrow = section.querySelector('.section-header__eyebrow');

    if (eyebrow && iconMap[id] && !eyebrow.querySelector('[data-lucide]')) {
      const icon = document.createElement('span');
      icon.setAttribute('data-lucide', iconMap[id]);
      icon.setAttribute('aria-hidden', 'true');
      eyebrow.prepend(icon);
    }
  });
};

const initHelpFab = () => {
  const button = document.querySelector('[data-help-fab]');
  const helpSection = document.querySelector('#help');

  if (!button || !helpSection) {
    return;
  }

  button.addEventListener('click', () => {
    helpSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
};

const initSectionLinkState = () => {
  const links = Array.from(document.querySelectorAll('.coc-toc a[href^="#"]'));

  if (!links.length || !window.IntersectionObserver) {
    return;
  }

  const sections = links
    .map((link) => {
      const id = link.getAttribute('href');
      if (!id) {
        return null;
      }

      const section = document.querySelector(id);
      if (!section) {
        return null;
      }

      return { link, section };
    })
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const setActive = (activeLink) => {
    sections.forEach(({ link }) => {
      if (link === activeLink) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const match = sections.find(({ section }) => section === entry.target);
      if (match) {
        setActive(match.link);
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '-20% 0px -50% 0px'
  });

  sections.forEach(({ section }) => observer.observe(section));
};

const bootstrapCocPage = () => {
  setLastUpdated();
  initReadingProgress();
  initHelpFab();
  initScrollTop();
  initSectionDecorators();
  initSectionLinkState();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapCocPage, { once: true });
} else {
  bootstrapCocPage();
}
