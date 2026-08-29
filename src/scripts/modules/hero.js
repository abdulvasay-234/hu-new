import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/media-query.js';
import { galleryImageFileNames } from '../data/gallery-images-data.js';

const getHeroImagePath = (basePath, fileName) => `${basePath}${encodeURIComponent(fileName)}`;

const hydrateHeroGalleryImages = () => {
  const heroImages = document.querySelectorAll('[data-hero-gallery-image]');

  heroImages.forEach((image, elementIndex) => {
    const basePath = image.dataset.heroBasePath || './Images/gallery/';
    const fallbackIndex = Number.parseInt(image.dataset.heroImageIndex ?? `${elementIndex}`, 10);
    const normalizedIndex = Number.isNaN(fallbackIndex)
      ? 0
      : ((fallbackIndex % galleryImageFileNames.length) + galleryImageFileNames.length) % galleryImageFileNames.length;
    const fileName = galleryImageFileNames[normalizedIndex];

    if (!fileName) {
      return;
    }

    const nextSrc = getHeroImagePath(basePath, fileName);
    image.src = nextSrc;
    image.dataset.src = nextSrc;
  });
};

export const initHero = () => {
  hydrateHeroGalleryImages();

  const hero = document.querySelector('.hero');

  if (!hero || prefersReducedMotion()) {
    return;
  }

  const eyebrow = hero.querySelector('.hero__eyebrow');
  const title = hero.querySelector('.hero__title');
  const text = hero.querySelector('.hero__text');
  const actions = hero.querySelector('.hero__actions');
  const highlights = hero.querySelectorAll('.hero-highlight');
  const visual = hero.querySelector('.hero__visual');
  const floatingCards = hero.querySelectorAll('.hero-visual__frame, .hero-visual__card');

  // Fallback: keep hero visuals visible even if an animation sequence is interrupted.
  const ensureVisualVisible = () => {
    if (!visual) {
      return;
    }

    gsap.set(visual, { autoAlpha: 1, y: 0, clearProps: 'transform,opacity,visibility' });
  };

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: ensureVisualVisible,
    onInterrupt: ensureVisualVisible
  });

  timeline
    .from(eyebrow, { autoAlpha: 0, y: 12, duration: 0.45 })
    .from(title, { autoAlpha: 0, y: 28, duration: 0.7 }, '-=0.1')
    .from(text, { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.35')
    .from(actions, { autoAlpha: 0, y: 14, duration: 0.45 }, '-=0.3')
    .from(highlights, { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.08 }, '-=0.25')
    .from(visual, { autoAlpha: 0, y: 24, duration: 0.8 }, '-=0.7');

  window.setTimeout(ensureVisualVisible, 700);

  floatingCards.forEach((card, index) => {
    gsap.to(card, {
      y: index % 2 === 0 ? 10 : -8,
      duration: 4.5 + index * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.2
    });
  });
};