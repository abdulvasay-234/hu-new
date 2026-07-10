import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/media-query.js';

export const initHero = () => {
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

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  timeline
    .from(eyebrow, { autoAlpha: 0, y: 12, duration: 0.45 })
    .from(title, { autoAlpha: 0, y: 28, duration: 0.7 }, '-=0.1')
    .from(text, { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.35')
    .from(actions, { autoAlpha: 0, y: 14, duration: 0.45 }, '-=0.3')
    .from(highlights, { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.08 }, '-=0.25')
    .from(visual, { autoAlpha: 0, y: 24, duration: 0.8 }, '-=0.7');

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