import { galleryImageFileNames } from '../data/gallery-images-data.js';

const getImagePath = (basePath, fileName) => `${basePath}${encodeURIComponent(fileName)}`;
const LAZY_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"%3E%3C/svg%3E';
const EAGER_IMAGE_COUNT_DEFAULT = 4;
const EAGER_IMAGE_COUNT_MOBILE = 1;

const isConstrainedDevice = () => {
  const prefersNarrowLayout = window.matchMedia('(max-width: 768px)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveDataEnabled = Boolean(connection?.saveData);
  const lowBandwidth = typeof connection?.effectiveType === 'string'
    ? connection.effectiveType.includes('2g')
    : false;

  return prefersNarrowLayout || saveDataEnabled || lowBandwidth;
};

const populateTrack = (track, fileNames, { basePath, altPrefix, constrained }) => {
  const eagerImageCount = constrained ? EAGER_IMAGE_COUNT_MOBILE : EAGER_IMAGE_COUNT_DEFAULT;
  const renderSource = constrained ? fileNames : [...fileNames, ...fileNames];

  track.replaceChildren();

  renderSource.forEach((fileName, index) => {
    const image = document.createElement('img');
    const isDuplicatedCopy = index >= fileNames.length;
    const resolvedSrc = getImagePath(basePath, fileName);
    const shouldLoadEagerly = !isDuplicatedCopy && index < eagerImageCount;

    if (shouldLoadEagerly) {
      image.src = resolvedSrc;
      image.loading = 'eager';
      image.fetchPriority = index < 2 ? 'high' : 'auto';
    } else {
      image.src = LAZY_PLACEHOLDER;
      image.dataset.src = resolvedSrc;
      image.dataset.lazy = 'true';
      image.loading = 'lazy';
    }

    image.decoding = 'async';

    if (isDuplicatedCopy) {
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
    } else {
      image.alt = `${altPrefix} ${index + 1}`;
    }

    track.append(image);
  });
};

const setupMarqueeAnimationObserver = (marquee) => {
  const tracks = marquee.querySelectorAll('.photo-marquee__track');

  if (!tracks.length) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    tracks.forEach((track) => track.classList.remove('is-paused'));
    return;
  }

  tracks.forEach((track) => track.classList.add('is-paused'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const shouldPause = !entry.isIntersecting;
      tracks.forEach((track) => track.classList.toggle('is-paused', shouldPause));
    });
  }, {
    threshold: 0.12,
    rootMargin: '18% 0px'
  });

  observer.observe(marquee);
};

const initPhotoMarquees = () => {
  const marquees = document.querySelectorAll('[data-photo-marquee]');
  const constrained = isConstrainedDevice();

  marquees.forEach((marquee) => {
    const basePath = marquee.dataset.galleryBasePath || './images/gallery-optimized/';
    const altPrefix = marquee.dataset.galleryAltPrefix || 'HackUnion gallery moment';
    const tracks = marquee.querySelectorAll('.photo-marquee__track');

    const sourceImages = constrained
      ? galleryImageFileNames.slice(0, Math.min(8, galleryImageFileNames.length))
      : galleryImageFileNames;
    const topLaneImages = sourceImages.filter((_, imageIndex) => imageIndex % 2 === 0);
    const bottomLaneImages = sourceImages.filter((_, imageIndex) => imageIndex % 2 !== 0);

    tracks.forEach((track, index) => {
      const laneImages = track.classList.contains('photo-marquee__track--reverse')
        ? bottomLaneImages
        : topLaneImages;
      const source = track.classList.contains('photo-marquee__track--reverse')
        ? [...laneImages].reverse()
        : laneImages;

      populateTrack(track, source, {
        basePath,
        altPrefix,
        constrained
      });
    });

    setupMarqueeAnimationObserver(marquee);
  });
};

export const initGallery = () => {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    gallery.setAttribute('role', 'list');

    gallery.querySelectorAll('figure').forEach((item) => {
      item.setAttribute('data-hover', item.getAttribute('data-hover') ?? 'gallery');
    });
  });

  initPhotoMarquees();
};
