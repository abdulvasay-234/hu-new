import { initNavigation } from './modules/navigation.js';
import { initFooter } from './modules/footer.js';
import { initTabs } from './modules/tabs.js';
import { initToasts } from './modules/toasts.js';
import { initBackToTop } from './modules/back-to-top.js';
import { initScrollIndicator } from './modules/scroll-indicator.js';
import { initAnimations } from './modules/animations.js';
import { initTheme } from './modules/theme.js';
import { initLazyLoading } from './modules/image-lazy-loading.js';
import { initAccordion } from './modules/accordion.js';
import { initModal } from './modules/modal.js';
import { renderLucideIcons } from './services/icons.js';
import { setPageMetadata } from './services/seo.js';
import { siteConfig } from './data/site-config.js';

const page = document.body.dataset.page ?? 'shared';
const initialHash = window.location.hash;

const getPageMetadata = () => {
  const { seoTitle, seoDescription, seoImage, seoUrl } = document.body.dataset;

  return {
    title: seoTitle ?? 'HackUnion v2',
    description: seoDescription ?? 'HackUnion is a builder-first technology community for developers, designers, AI engineers, founders, and open source contributors.',
    image: seoImage ?? siteConfig.socialImage,
    url: seoUrl ?? siteConfig.url
  };
};

let isSmoothScrollReady = false;
let smoothScrollInitPromise;

const loadOnce = (loader) => {
  if (!loader.promise) {
    loader.promise = loader.importer().then((module) => {
      module[loader.exportName]?.();
    });
  }

  return loader.promise;
};

const featureLoaders = [
  {
    selector: '[data-photo-marquee], [data-gallery]',
    importer: () => import('./modules/gallery.js'),
    exportName: 'initGallery'
  },
  {
    selector: '[data-counter], [data-counter-target]',
    importer: () => import('./modules/counter.js'),
    exportName: 'initCounter'
  },
  {
    selector: '[data-manifesto-section]',
    importer: () => import('./modules/manifesto.js'),
    exportName: 'initManifesto'
  },
  {
    selector: '[data-why-hackunion]',
    importer: () => import('./modules/why-hackunion.js'),
    exportName: 'initWhyHackUnion'
  },
  {
    selector: '[data-projects-section], [data-project-detail]',
    importer: () => import('./modules/projects.js'),
    exportName: 'initProjects'
  },
  {
    selector: '[data-experiences-section]',
    importer: () => import('./modules/experiences.js'),
    exportName: 'initExperiences'
  },
  {
    selector: '[data-community-action-section]',
    importer: () => import('./modules/community-in-action.js'),
    exportName: 'initCommunityInAction'
  },
  {
    selector: '[data-community-videos-section]',
    importer: () => import('./modules/community-videos.js'),
    exportName: 'initCommunityVideos'
  },
  {
    selector: '[data-partners-section]',
    importer: () => import('./modules/partners-ecosystem.js'),
    exportName: 'initPartnersEcosystem'
  },
  {
    selector: '[data-final-cta-section]',
    importer: () => import('./modules/final-cta.js'),
    exportName: 'initFinalCta'
  },
  {
    selector: '.hero',
    importer: () => import('./modules/hero.js'),
    exportName: 'initHero'
  },
  {
    selector: '[data-obw-countdown]',
    importer: () => import('./modules/open-build-week.js'),
    exportName: 'initOpenBuildWeek'
  },
  {
    selector: '[data-copy-hex]',
    importer: () => import('./modules/brand-kit.js'),
    exportName: 'initBrandKit'
  },
  {
    selector: '[data-organizer-grid], [data-organizer-responsibilities], [data-organizer-modals]',
    importer: () => import('./modules/organizers.js'),
    exportName: 'initOrganizers'
  },
  {
    selector: '[data-certificates-portal]',
    importer: () => import('./modules/certificates.js'),
    exportName: 'initCertificates'
  },
  {
    selector: '[data-blog-grid], [data-share]',
    importer: () => import('./modules/blogs.js'),
    exportName: 'initBlogs'
  },
  {
    selector: '[data-copilot-dev-days-app]',
    importer: () => import('./modules/copilot-dev-days.js'),
    exportName: 'initCopilotDevDays'
  }
];

const initPageFeatures = async () => {
  const pending = featureLoaders
    .filter((loader) => document.querySelector(loader.selector))
    .map((loader) => loadOnce(loader));

  if (!pending.length) {
    return;
  }

  await Promise.all(pending);
};

const ensureSmoothScroll = () => {
  if (isSmoothScrollReady) {
    return Promise.resolve();
  }

  if (initialHash && initialHash !== '#') {
    return Promise.resolve();
  }

  if (!smoothScrollInitPromise) {
    smoothScrollInitPromise = import('./modules/scroll.js').then((module) => {
      module.initScroll();
      isSmoothScrollReady = true;
    });
  }

  return smoothScrollInitPromise;
};

const scrollToHashTarget = () => {
  const hash = window.location.hash;

  if (!hash || hash === '#') {
    return;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'auto', block: 'start' });
};

const bootstrap = async () => {
  document.documentElement.classList.add('has-js');

  setPageMetadata(getPageMetadata());
  initTheme();
  initNavigation();
  initFooter();
  initTabs();
  initToasts();
  initBackToTop();
  initScrollIndicator();
  initAccordion();
  initModal();

  void initPageFeatures();
  void renderLucideIcons();

  initLazyLoading();
  initAnimations(page);

  const settleInitialPosition = async () => {
    scrollToHashTarget();
    await ensureSmoothScroll();
  };

  // Re-apply hash scroll after dynamic sections mount so anchors land correctly.
  requestAnimationFrame(() => {
    requestAnimationFrame(settleInitialPosition);
  });

  window.setTimeout(settleInitialPosition, 180);
  window.setTimeout(settleInitialPosition, 650);

  window.addEventListener('load', settleInitialPosition, { once: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}