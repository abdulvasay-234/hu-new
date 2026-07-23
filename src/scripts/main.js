import { initNavigation } from './modules/navigation.js';
import { initFooter } from './modules/footer.js';
import { initTabs } from './modules/tabs.js';
import { initToasts } from './modules/toasts.js';
import { initBackToTop } from './modules/back-to-top.js';
import { initScrollIndicator } from './modules/scroll-indicator.js';
import { initScroll } from './modules/scroll.js';
import { initAnimations } from './modules/animations.js';
import { initTheme } from './modules/theme.js';
import { initLazyLoading } from './modules/image-lazy-loading.js';
import { initAccordion } from './modules/accordion.js';
import { initModal } from './modules/modal.js';
import { initGallery } from './modules/gallery.js';
import { initCounter } from './modules/counter.js';
import { initManifesto } from './modules/manifesto.js';
import { initExperiences } from './modules/experiences.js';
import { initCommunityInAction } from './modules/community-in-action.js';
import { initPartnersEcosystem } from './modules/partners-ecosystem.js';
import { initFinalCta } from './modules/final-cta.js';
import { initHero } from './modules/hero.js';
import { initOpenBuildWeek } from './modules/open-build-week.js';
import { initBrandKit } from './modules/brand-kit.js';
import { initOrganizers } from './modules/organizers.js';
import { initCertificates } from './modules/certificates.js';
import { createIcons, icons } from '../../node_modules/lucide/dist/esm/lucide.js';
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

const ensureSmoothScroll = () => {
  if (isSmoothScrollReady) {
    return;
  }

  if (initialHash && initialHash !== '#') {
    return;
  }

  initScroll();
  isSmoothScrollReady = true;
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

const bootstrap = () => {
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
  initOrganizers();
  initModal();
  initManifesto();
  initExperiences();
  initCommunityInAction();
  initPartnersEcosystem();
  initFinalCta();
  createIcons({ icons });
  initLazyLoading();
  initGallery();
  initCounter();
  initAnimations(page);
  initHero();
  initOpenBuildWeek();
  initBrandKit();
  initCertificates();

  const settleInitialPosition = () => {
    scrollToHashTarget();
    ensureSmoothScroll();
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