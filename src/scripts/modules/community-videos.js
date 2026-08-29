import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import { communityVideos, youtubeChannelUrl } from '../data/community-videos-data.js';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getVideoUrl = (video) => {
  const itemUrl = typeof video.url === 'string' ? video.url.trim() : '';

  if (itemUrl) {
    return itemUrl;
  }

  if (video.videoId) {
    return `https://www.youtube.com/watch?v=${video.videoId}`;
  }

  return youtubeChannelUrl;
};

const getThumbnailUrl = (video) => {
  if (video.videoId) {
    return `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  }

  const fallbackThumbnail = typeof video.thumbnail === 'string' ? video.thumbnail.trim() : '';

  return fallbackThumbnail || './Images/hero-section.jpg';
};

const renderVideoCard = (video, index, modalSelector) => {
  const thumbnail = getThumbnailUrl(video);
  const videoUrl = getVideoUrl(video);
  const hasVideoId = Boolean(video.videoId);
  const safeTitle = escapeHtml(video.title);
  const safeDescription = escapeHtml(video.description);
  const safeCategory = escapeHtml(video.category || 'Community');
  const safeThumbnail = escapeHtml(thumbnail);
  const safeUrl = escapeHtml(videoUrl);

  const mediaControl = hasVideoId
    ? `
      <button
        class="community-video-card__media-button"
        type="button"
        data-modal-open="${modalSelector}"
        data-community-video-trigger
        data-community-video-id="${escapeHtml(video.videoId)}"
        data-community-video-title="${safeTitle}"
        aria-controls="community-video-modal"
        aria-label="Play ${safeTitle}"
      >
        <img src="${safeThumbnail}" alt="${safeTitle} video thumbnail" loading="lazy" decoding="async" />
        <span class="community-video-card__play" aria-hidden="true"><span></span></span>
      </button>
    `
    : `
      <a
        class="community-video-card__media-button"
        href="${safeUrl}"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Open ${safeTitle} on HackUnion YouTube channel"
      >
        <img src="${safeThumbnail}" alt="${safeTitle} video thumbnail" loading="lazy" decoding="async" />
        <span class="community-video-card__play" aria-hidden="true"><span></span></span>
      </a>
    `;

  const watchAction = hasVideoId
    ? `
      <button
        class="community-video-card__watch"
        type="button"
        data-modal-open="${modalSelector}"
        data-community-video-trigger
        data-community-video-id="${escapeHtml(video.videoId)}"
        data-community-video-title="${safeTitle}"
        aria-controls="community-video-modal"
        aria-label="Play ${safeTitle}"
      >
        Watch <span aria-hidden="true">→</span>
      </button>
    `
    : `
      <a
        class="community-video-card__watch"
        href="${safeUrl}"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Open ${safeTitle} on HackUnion YouTube channel"
      >
        Watch <span aria-hidden="true">→</span>
      </a>
    `;

  return `
    <article class="community-video-card" style="--community-video-delay: ${index * 80}ms">
      <div class="community-video-card__media">
        ${mediaControl}
      </div>
      <div class="community-video-card__body">
        <p class="community-video-card__category">${safeCategory}</p>
        <h3 class="community-video-card__title">${safeTitle}</h3>
        <p class="community-video-card__description">${safeDescription}</p>
        ${watchAction}
      </div>
    </article>
  `;
};

const createVideoIframe = (videoId, title) => `
  <iframe
    src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}?rel=0"
    title="${escapeHtml(title)}"
    loading="lazy"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
`;

export const initCommunityVideos = () => {
  const section = document.querySelector('[data-community-videos-section]');

  if (!section) {
    return;
  }

  const gridTarget = section.querySelector('[data-community-videos-grid]');
  const modal = document.querySelector('#community-video-modal');
  const modalTitle = modal?.querySelector('[data-community-video-modal-title]');
  const modalFrameTarget = modal?.querySelector('[data-community-video-modal-frame]');
  const modalSelector = '#community-video-modal';

  const featuredVideos = communityVideos.slice(0, 3);

  if (gridTarget) {
    gridTarget.innerHTML = featuredVideos.map((video, index) => renderVideoCard(video, index, modalSelector)).join('');
  }

  if (modal && modalFrameTarget) {
    section.addEventListener('click', (event) => {
      const trigger = event.target instanceof HTMLElement ? event.target.closest('[data-community-video-trigger]') : null;

      if (!trigger) {
        return;
      }

      const videoId = trigger.getAttribute('data-community-video-id') || '';
      const title = trigger.getAttribute('data-community-video-title') || 'HackUnion community video';

      if (!videoId) {
        return;
      }

      modalTitle.textContent = title;
      modalFrameTarget.innerHTML = createVideoIframe(videoId, title);
    });

    const cleanupModalVideo = () => {
      modalFrameTarget.innerHTML = '';
      modalTitle.textContent = 'Community Video';
    };

    const closeObserver = new MutationObserver(() => {
      if (modal.getAttribute('aria-hidden') === 'true') {
        cleanupModalVideo();
      }
    });

    closeObserver.observe(modal, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    });
  }

  if (prefersReducedMotion()) {
    section.classList.add('is-visible');
    return;
  }

  const observer = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      section.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  if (!observer) {
    section.classList.add('is-visible');
    return;
  }

  observer.observe(section);
};
