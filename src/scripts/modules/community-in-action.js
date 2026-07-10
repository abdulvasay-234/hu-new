import { createObserver } from './intersection-observer.js';
import { prefersReducedMotion } from '../utils/media-query.js';
import {
  communityGalleryItems,
  communityImpactMetrics,
  communityStories,
  communityGalleryToneMap
} from '../data/community-in-action-data.js';

const imageSpanClassMap = {
  wide: 'community-gallery__item--wide',
  tall: 'community-gallery__item--tall',
  square: 'community-gallery__item--square',
  portrait: 'community-gallery__item--portrait'
};

const createPlaceholderImage = (title, tone, variant = 'scene') => {
  const [colorA, colorB] = communityGalleryToneMap[tone] ?? communityGalleryToneMap.blue;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorB}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${colorA}" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="165" cy="150" r="125" fill="url(#glow)" opacity="0.8" />
      <circle cx="1020" cy="130" r="155" fill="rgba(255,255,255,0.12)" />
      <circle cx="950" cy="700" r="220" fill="rgba(255,255,255,0.08)" />
      <rect x="90" y="560" width="360" height="14" rx="7" fill="rgba(255,255,255,0.36)" />
      <rect x="90" y="602" width="240" height="12" rx="6" fill="rgba(255,255,255,0.24)" />
      <rect x="90" y="648" width="168" height="12" rx="6" fill="rgba(255,255,255,0.18)" />
      <rect x="704" y="188" width="320" height="216" rx="34" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.14)" />
      <rect x="740" y="224" width="112" height="112" rx="24" fill="rgba(255,255,255,0.16)" />
      <rect x="872" y="224" width="112" height="112" rx="24" fill="rgba(255,255,255,0.12)" />
      <text x="90" y="190" fill="#ffffff" font-family="Arial, sans-serif" font-size="72" font-weight="700">${title}</text>
      <text x="90" y="260" fill="rgba(255,255,255,0.84)" font-family="Arial, sans-serif" font-size="28">${variant === 'portrait' ? 'Community moment' : 'Builder moment'}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createAvatarImage = (name, role, tone) => {
  const [colorA, colorB] = communityGalleryToneMap[tone] ?? communityGalleryToneMap.blue;
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="200" fill="url(#avatarBg)" />
      <circle cx="200" cy="172" r="70" fill="rgba(255,255,255,0.2)" />
      <rect x="102" y="250" width="196" height="84" rx="42" fill="rgba(255,255,255,0.22)" />
      <text x="200" y="210" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="88" font-weight="700">${initials}</text>
      <text x="200" y="345" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="24">${role}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const renderGalleryItem = (item, index) => {
  const src = item.image ?? createPlaceholderImage(item.title, item.tone, item.span);
  const initialSrc = item.image ?? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" fill="#e5e7eb"/></svg>')}`;

  return `
    <li class="community-gallery__item ${imageSpanClassMap[item.span] ?? imageSpanClassMap.square}" style="--community-delay: ${index * 80}ms">
      <figure class="community-gallery__figure">
        <img class="community-gallery__image" data-community-image data-src="${src}" src="${initialSrc}" alt="${item.alt}" loading="lazy" decoding="async" />
        <figcaption class="community-gallery__caption">
          <span class="community-gallery__caption-label">${item.title}</span>
          <span class="community-gallery__caption-text">${item.caption}</span>
        </figcaption>
      </figure>
    </li>
  `;
};

const renderImpactCard = (metric, index) => `
  <article class="community-impact__card" style="--community-delay: ${index * 80}ms">
    <div class="community-impact__value" aria-hidden="true">
      <span data-counter-target="${metric.value}" data-counter-suffix="${metric.suffix}">${metric.value}${metric.suffix}</span>
    </div>
    <h3>${metric.label}</h3>
    <p>${metric.description}</p>
  </article>
`;

const renderStoryCard = (story, index) => {
  const avatarTone = ['blue', 'amber', 'cyan', 'teal'][index % 4];
  const avatarSrc = story.image ?? createAvatarImage(story.name, story.role, avatarTone);
  const initialAvatarSrc = story.image ?? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" fill="#e5e7eb"/></svg>')}`;

  return `
    <article class="community-story ${story.featured ? 'community-story--featured' : ''}" style="--community-delay: ${index * 80}ms">
      <div class="community-story__media">
        <img class="community-story__avatar" data-community-image data-src="${avatarSrc}" src="${initialAvatarSrc}" alt="Portrait placeholder for ${story.name}" loading="lazy" decoding="async" />
      </div>
      <div class="community-story__body">
        <span class="badge">${story.category}</span>
        <h3>${story.name}</h3>
        <p class="community-story__role">${story.role}</p>
        <blockquote class="community-story__quote">${story.story}</blockquote>
        <p class="community-story__outcome">${story.outcome}</p>
      </div>
    </article>
  `;
};

export const initCommunityInAction = () => {
  const section = document.querySelector('[data-community-action-section]');

  if (!section) {
    return;
  }

  const galleryTarget = section.querySelector('[data-community-gallery]');
  const impactTarget = section.querySelector('[data-community-impact]');
  const featuredStoryTarget = section.querySelector('[data-community-featured-story]');
  const storyGridTarget = section.querySelector('[data-community-story-grid]');

  if (galleryTarget) {
    galleryTarget.innerHTML = communityGalleryItems.map((item, index) => renderGalleryItem(item, index)).join('');
  }

  if (impactTarget) {
    impactTarget.innerHTML = communityImpactMetrics.map((metric, index) => renderImpactCard(metric, index)).join('');
  }

  if (featuredStoryTarget) {
    const [featuredStory, ...otherStories] = communityStories;
    featuredStoryTarget.innerHTML = featuredStory ? renderStoryCard(featuredStory, 0) : '';

    if (storyGridTarget) {
      storyGridTarget.innerHTML = otherStories.map((story, index) => renderStoryCard(story, index + 1)).join('');
    }
  }

  if (prefersReducedMotion()) {
    section.classList.add('is-visible');
    return;
  }

  const observer = createObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      section.classList.add('is-visible');

      instance.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -12% 0px'
  });

  if (!observer) {
    section.classList.add('is-visible');
    return;
  }

  observer?.observe(section);
};