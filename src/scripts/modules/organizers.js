import { organizers, organizerResponsibilities } from '../data/organizers-data.js';

const SOCIAL_ICON_MAP = {
  linkedin: 'linkedin',
  github: 'github',
  x: 'twitter',
  email: 'mail'
};

const SOCIAL_LABEL_MAP = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  email: 'Email'
};

const listToHtml = (items = []) => items.map((item) => `<li>${item}</li>`).join('');

const socialLinksHtml = (links = {}, organizerName, compact = false) => Object.entries(links)
  .map(([key, href]) => {
    if (!href || !SOCIAL_ICON_MAP[key]) {
      return '';
    }

    const label = SOCIAL_LABEL_MAP[key];
    const icon = SOCIAL_ICON_MAP[key];
    const rel = key === 'email' ? '' : ' rel="noopener noreferrer"';
    const target = key === 'email' ? '' : ' target="_blank"';

    if (compact) {
      return `<a href="${href}"${target}${rel} aria-label="${organizerName} on ${label}"><span data-lucide="${icon}" aria-hidden="true"></span></a>`;
    }

    return `<a class="button button--secondary" href="${href}"${target}${rel}><span data-lucide="${icon}" aria-hidden="true"></span><span>${label}</span></a>`;
  })
  .join('');

const renderResponsibilities = () => {
  const root = document.querySelector('[data-organizer-responsibilities]');

  if (!root) {
    return;
  }

  root.innerHTML = organizerResponsibilities.map((item) => `
    <article class="card organizers-responsibility-card" data-animate>
      <div class="organizers-responsibility-card__icon" aria-hidden="true">
        <span data-lucide="${item.icon}"></span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `).join('');
};

const renderOrganizerCards = () => {
  const root = document.querySelector('[data-organizer-grid]');

  if (!root) {
    return;
  }

  root.innerHTML = organizers.map((organizer) => `
    <article class="card organizer-card" data-animate>
      <button class="organizer-card__button" type="button" data-modal-open="#organizer-modal-${organizer.id}" aria-controls="organizer-modal-${organizer.id}">
        <div class="organizer-card__photo-wrap">
          <img class="organizer-card__photo" src="${organizer.image}" alt="${organizer.imageAlt}" loading="lazy" decoding="async" />
          <span class="organizer-card__verified badge badge--open-source"><span data-lucide="badge-check"></span>Verified</span>
        </div>
        <div class="organizer-card__body">
          <h3>${organizer.name}</h3>
          <p class="organizer-card__role">${organizer.role}</p>
          <p class="organizer-card__bio">${organizer.shortBio}</p>
          <p class="organizer-card__label">Areas of Responsibility</p>
          <ul class="organizer-card__chips" aria-label="${organizer.name} responsibilities">
            ${listToHtml(organizer.responsibilities)}
          </ul>
          <div class="organizer-card__meta" aria-label="${organizer.name} verification info">
            <p><strong>Community Status:</strong> <span data-lucide="badge-check" aria-hidden="true"></span> ${organizer.communityStatus}</p>
            <p><strong>Member Since:</strong> ${organizer.memberSince}</p>
            <p><strong>Location:</strong> ${organizer.location}</p>
          </div>
          <div class="organizer-card__socials" aria-label="${organizer.name} social links">
            ${socialLinksHtml(organizer.links, organizer.name, true)}
          </div>
        </div>
      </button>
    </article>
  `).join('');
};

const renderOrganizerModals = () => {
  const root = document.querySelector('[data-organizer-modals]');

  if (!root) {
    return;
  }

  root.innerHTML = organizers.map((organizer) => `
    <div class="modal organizer-modal" id="organizer-modal-${organizer.id}" data-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="organizer-modal-title-${organizer.id}">
      <div class="modal__overlay" data-modal-overlay></div>
      <div class="modal__dialog organizer-modal__dialog">
        <div class="modal__header organizer-modal__header">
          <h2 id="organizer-modal-title-${organizer.id}">${organizer.name}</h2>
          <button class="button button--ghost modal__close" type="button" data-modal-close aria-label="Close ${organizer.name} profile">
            <span data-lucide="x" aria-hidden="true"></span>
          </button>
        </div>
        <div class="modal__body organizer-modal__body">
          <img class="organizer-modal__photo" src="${organizer.image}" alt="${organizer.imageAlt}" loading="lazy" decoding="async" />
          <div class="organizer-modal__content">
            <p class="organizer-modal__role">${organizer.role}</p>
            <p>${organizer.fullBio}</p>
            <div class="organizer-modal__grid">
              <section>
                <h3>Responsibilities</h3>
                <ul>${listToHtml(organizer.responsibilities)}</ul>
              </section>
              <section>
                <h3>Current Initiatives</h3>
                <ul>${listToHtml(organizer.currentInitiatives)}</ul>
              </section>
              <section>
                <h3>Communities Involved</h3>
                <ul>${listToHtml(organizer.communities)}</ul>
              </section>
              <section>
                <h3>Skills</h3>
                <ul>${listToHtml(organizer.skills)}</ul>
              </section>
              <section>
                <h3>Volunteer Opportunities</h3>
                <ul>${listToHtml(organizer.volunteerOpportunities)}</ul>
              </section>
              <section>
                <h3>Profile Details</h3>
                <ul>
                  <li><strong>Years with HackUnion:</strong> ${organizer.yearsWithHackUnion}</li>
                  <li><strong>Community Status:</strong> ${organizer.communityStatus}</li>
                  <li><strong>Member Since:</strong> ${organizer.memberSince}</li>
                  <li><strong>Location:</strong> ${organizer.location}</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
        <div class="modal__footer organizer-modal__footer">
          <div class="organizer-modal__socials">
            ${socialLinksHtml(organizer.links, organizer.name, false)}
          </div>
        </div>
      </div>
    </div>
  `).join('');
};

export const initOrganizers = () => {
  renderResponsibilities();
  renderOrganizerCards();
  renderOrganizerModals();
};