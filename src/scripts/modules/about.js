import { organizers } from '../data/organizers-data.js';
import { getSiteRootPath, toSiteHref } from '../utils/site-path.js';

const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  email: 'Email'
};

const toSocialLink = (type, href, name) => {
  if (!href || !SOCIAL_LABELS[type]) {
    return '';
  }

  const isEmail = type === 'email';
  const rel = isEmail ? '' : ' rel="noopener noreferrer"';
  const target = isEmail ? '' : ' target="_blank"';

  return `<a href="${href}"${target}${rel} aria-label="${name} on ${SOCIAL_LABELS[type]}">${SOCIAL_LABELS[type]}</a>`;
};

const teamCardMarkup = (person, rootPath) => {
  const socials = Object.entries(person.links ?? {})
    .map(([type, href]) => toSocialLink(type, href, person.name))
    .filter(Boolean)
    .join('');

  return `
    <article class="about-team-card card" data-animate>
      <img class="about-team-card__image" src="${toSiteHref(person.image, { rootPath })}" alt="${person.imageAlt}" loading="lazy" decoding="async" />
      <p class="about-team-card__role">${person.role}</p>
      <h3>${person.name}</h3>
      <p class="about-team-card__bio">${person.shortBio}</p>
      ${socials ? `<div class="about-team-card__socials" aria-label="${person.name} social links">${socials}</div>` : ''}
    </article>
  `;
};

export const initAbout = () => {
  const root = document.querySelector('[data-about-team-grid]');

  if (!root) {
    return;
  }

  const rootPath = getSiteRootPath();
  root.innerHTML = organizers.map((person) => teamCardMarkup(person, rootPath)).join('');
};