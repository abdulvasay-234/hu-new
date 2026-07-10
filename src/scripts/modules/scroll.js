import Lenis from 'lenis';
import { prefersReducedMotion } from '../utils/media-query.js';

let lenisInstance;
let animationFrameId;

export const initScroll = () => {
  if (prefersReducedMotion()) return;

  if (lenisInstance) {
    return;
  }

  lenisInstance = new Lenis({
    duration: 1.1,
    smooth: true,
    lerp: 0.08
  });

  const raf = (time) => {
    lenisInstance.raf(time);
    animationFrameId = requestAnimationFrame(raf);
  };

  animationFrameId = requestAnimationFrame(raf);
};

export const scrollToTop = () => {
  if (prefersReducedMotion() || !lenisInstance) {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    return;
  }

  lenisInstance.scrollTo(0, { duration: 1 });
};

export const scrollToTarget = (target, options = {}) => {
  if (!target) {
    return;
  }

  const destination = typeof target === 'string' ? document.querySelector(target) : target;
  if (!destination) {
    return;
  }

  if (prefersReducedMotion() || !lenisInstance) {
    destination.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    return;
  }

  lenisInstance.scrollTo(destination, {
    duration: options.duration ?? 1,
    offset: options.offset ?? 0
  });
};

export const destroyScroll = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  lenisInstance?.destroy();
  lenisInstance = undefined;
};
