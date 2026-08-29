import { renderLucideIcons } from '../services/icons.js';
import { initAnimations } from './animations.js';
import { setPageMetadata } from '../services/seo.js';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const toRootUrl = (rootPath, value) => {
  if (!value) {
    return '';
  }

  if (/^(https?:|mailto:|tel:|data:)/i.test(value) || value.startsWith('#')) {
    return value;
  }

  const cleanedRoot = rootPath.endsWith('/') ? rootPath : `${rootPath}/`;
  const cleanedValue = value.replace(/^\//, '');
  return `${cleanedRoot}${cleanedValue}`;
};

const toAbsoluteUrl = (value) => {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, window.location.href).toString();
  } catch {
    return value;
  }
};

const normalizeEditionStatus = (status) => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'current') {
    return 'CURRENT EDITION';
  }

  if (normalized === 'previous') {
    return 'PREVIOUS EDITION';
  }

  if (normalized === 'upcoming') {
    return 'UPCOMING EDITION';
  }

  return 'EDITION';
};

const uniqueBySlug = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    if (!item || !item.slug || seen.has(item.slug)) {
      return false;
    }

    seen.add(item.slug);
    return true;
  });
};

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
};

const renderHero = (series, rootPath) => {
  const primaryHref = toRootUrl(rootPath, series?.hero?.primaryCta?.href);
  const secondaryHref = toRootUrl(rootPath, series?.hero?.secondaryCta?.href);
  const visualBullets = Array.isArray(series?.hero?.visualBullets) ? series.hero.visualBullets : [];

  return `
<section class="section cdd-hero" aria-labelledby="cdd-hero-title">
  <div class="container container--wide cdd-hero__inner">
    <div class="cdd-hero__content stack stack--lg" data-animate="fade-up">
      <p class="eyebrow cdd-hero__eyebrow">${escapeHtml(series?.eyebrow || 'HACKUNION FLAGSHIP EXPERIENCE')}</p>
      <h1 id="cdd-hero-title" class="cdd-hero__title">${escapeHtml(series?.title || 'GitHub Copilot Dev Days')}</h1>
      <p class="cdd-hero__text">${escapeHtml(series?.tagline || '')}</p>
      <p class="cdd-hero__partnership" aria-label="Partnership">${escapeHtml(series?.partnership || 'Microsoft x GitHub x HackUnion')}</p>
      <div class="cdd-hero__actions">
        <a class="button button--primary" href="${escapeHtml(primaryHref)}">${escapeHtml(series?.hero?.primaryCta?.label || 'Explore Dev Days 2.0')} <span data-lucide="arrow-right"></span></a>
        <a class="button button--secondary" href="${escapeHtml(secondaryHref)}">${escapeHtml(series?.hero?.secondaryCta?.label || 'View Previous Edition')}</a>
      </div>
    </div>

    <aside class="cdd-hero__visual card" aria-label="Technical developer visual" data-animate="fade-up">
      <div class="cdd-editor" aria-hidden="true">
        <header class="cdd-editor__bar">
          <span></span><span></span><span></span>
          <p>copilot-dev-days.ts</p>
        </header>
        <div class="cdd-editor__lines">
          <p><span class="cdd-token cdd-token--kw">const</span> <span class="cdd-token cdd-token--name">buildMode</span> = <span class="cdd-token cdd-token--str">\"hands-on\"</span>;</p>
          <p><span class="cdd-token cdd-token--kw">function</span> <span class="cdd-token cdd-token--name">shipWithCopilot</span>() {</p>
          <p><span class="cdd-token cdd-token--cm">// Learn, experiment, build, collaborate</span></p>
          <p>&nbsp;&nbsp;<span class="cdd-token cdd-token--kw">return</span> <span class="cdd-token cdd-token--str">\"builder-output\"</span>;</p>
          <p>}</p>
        </div>
      </div>
      <ul class="cdd-hero__signals" data-stagger>
        ${visualBullets.map((item) => `<li><span data-lucide="sparkles"></span>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </aside>
  </div>
</section>`;
};

const renderAbout = (series) => {
  const pillars = Array.isArray(series?.about?.pillars) ? series.about.pillars : [];

  return `
<section class="section cdd-about" aria-labelledby="cdd-about-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Flagship Overview</p>
      <h2 id="cdd-about-title" class="section-header__title">${escapeHtml(series?.about?.title || 'What is GitHub Copilot Dev Days?')}</h2>
      <p class="section-header__text">${escapeHtml(series?.about?.description || '')}</p>
    </div>
    <ul class="cdd-pillars" aria-label="Dev Days pillars" data-stagger>
      ${pillars.map((pillar) => `<li class="card cdd-pillars__item">${escapeHtml(pillar)}</li>`).join('')}
    </ul>
  </div>
</section>`;
};

const renderJourney = (series) => {
  const steps = Array.isArray(series?.experienceSteps) ? series.experienceSteps : [];

  return `
<section class="section cdd-journey" aria-labelledby="cdd-journey-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">The Experience</p>
      <h2 id="cdd-journey-title" class="section-header__title">A four-step builder journey.</h2>
    </div>
    <ol class="cdd-timeline" data-stagger>
      ${steps.map((step) => `
      <li class="card cdd-timeline__step">
        <p class="cdd-timeline__index">${escapeHtml(step.id)}</p>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.description)}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
};

const renderEditionSpotlight = (edition, rootPath) => {
  if (!edition) {
    return '';
  }

  const registrationUrl = toRootUrl(rootPath, edition.registrationUrl || edition.eventUrl);
  const eventUrl = toRootUrl(rootPath, edition.eventUrl);
  const coverImage = toRootUrl(rootPath, edition.coverImage);

  return `
<section class="section cdd-current" id="current-edition" aria-labelledby="cdd-current-title">
  <div class="container container--wide">
    <article class="card cdd-current__card" data-animate="fade-up">
      <div class="cdd-current__media">
        <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(edition.coverImageAlt || edition.title)}" loading="eager" decoding="async" />
      </div>
      <div class="cdd-current__body">
        <p class="cdd-label">CURRENT EDITION</p>
        <h2 id="cdd-current-title">${escapeHtml(edition.title || 'GitHub Copilot Dev Days 2.0')}</h2>
        <p>${escapeHtml(edition.description || '')}</p>
        <dl class="cdd-meta" aria-label="Current edition details">
          <div><dt>Date</dt><dd>${escapeHtml(edition.dateLabel || edition.date || 'TBA')}</dd></div>
          <div><dt>Venue</dt><dd>${escapeHtml(edition.venue || 'TBA')}</dd></div>
          <div><dt>Location</dt><dd>${escapeHtml(edition.location || 'TBA')}</dd></div>
          <div><dt>Edition</dt><dd>Dev Days ${escapeHtml(edition.edition || '')}</dd></div>
        </dl>
        <div class="cdd-current__actions">
          <a class="button button--primary" href="${escapeHtml(registrationUrl)}">Register / Event Details</a>
          <a class="button button--secondary" href="${escapeHtml(eventUrl)}">View Event</a>
        </div>
      </div>
    </article>
  </div>
</section>`;
};

const renderInside = (items) => {
  const normalized = Array.isArray(items) ? items : [];

  return `
<section class="section cdd-inside" aria-labelledby="cdd-inside-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">What's Inside</p>
      <h2 id="cdd-inside-title" class="section-header__title">Hands-on components built for developers.</h2>
    </div>
    <div class="cdd-inside__grid" data-stagger>
      ${normalized.map((item) => `<article class="card cdd-inside__item"><h3>${escapeHtml(item)}</h3></article>`).join('')}
    </div>
  </div>
</section>`;
};

const renderPreviousEdition = (edition, rootPath) => {
  if (!edition) {
    return '';
  }

  const eventUrl = toRootUrl(rootPath, edition.eventUrl);
  const coverImage = toRootUrl(rootPath, edition.coverImage);
  const highlights = Array.isArray(edition.highlights) ? edition.highlights : [];

  return `
<section class="section cdd-previous" aria-labelledby="cdd-previous-title">
  <div class="container container--wide">
    <article class="card cdd-previous__card" data-animate="fade-up">
      <div class="cdd-previous__media">
        <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(edition.coverImageAlt || edition.title)}" loading="lazy" decoding="async" />
      </div>
      <div class="cdd-previous__body">
        <p class="cdd-label">PREVIOUS EDITION</p>
        <h2 id="cdd-previous-title">Dev Days ${escapeHtml(edition.edition || '1.0')}</h2>
        <p class="cdd-previous__meta">${escapeHtml(edition.dateLabel || edition.date || 'TBA')} · ${escapeHtml(edition.venue || 'TBA')}</p>
        <p>${escapeHtml(edition.description || '')}</p>
        <ul class="cdd-highlights" aria-label="Dev Days 1.0 highlights">
          ${highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}
        </ul>
        <a class="button button--secondary" href="${escapeHtml(eventUrl)}">Explore Dev Days 1.0</a>
      </div>
    </article>
  </div>
</section>`;
};

const renderEditions = (series, editions, rootPath) => {
  const cards = Array.isArray(editions) ? editions : [];

  return `
<section class="section cdd-editions" aria-labelledby="cdd-editions-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Editions</p>
      <h2 id="cdd-editions-title" class="section-header__title">A reusable system for every future Dev Days edition.</h2>
    </div>
    <div class="cdd-editions__grid" data-stagger>
      ${cards.map((edition) => {
        const href = toRootUrl(rootPath, `copilot-dev-days/${edition.slug}/`);
        return `
        <article class="card cdd-edition-card">
          <p class="cdd-edition-card__status">${escapeHtml(normalizeEditionStatus(edition.status))}</p>
          <h3>${escapeHtml(edition.edition)}</h3>
          <p>${escapeHtml(String(edition.year || ''))}</p>
          <a class="button button--text" href="${escapeHtml(href)}">Open Edition <span data-lucide="arrow-right"></span></a>
        </article>`;
      }).join('')}
    </div>
  </div>
</section>`;
};

const renderSpeakers = (speakers, rootPath) => {
  if (!Array.isArray(speakers) || !speakers.length) {
    return '';
  }

  return `
<section class="section cdd-speakers" aria-labelledby="cdd-speakers-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Speakers & Contributors</p>
      <h2 id="cdd-speakers-title" class="section-header__title">People shaping this edition.</h2>
    </div>
    <div class="cdd-speakers__grid" data-stagger>
      ${speakers.map((speaker) => {
        const image = toRootUrl(rootPath, speaker.photo);
        const socials = Array.isArray(speaker.socials) ? speaker.socials : [];

        return `
        <article class="card cdd-speaker">
          <img class="cdd-speaker__photo" src="${escapeHtml(image)}" alt="${escapeHtml(speaker.name || 'Speaker profile')}" loading="lazy" decoding="async" />
          <div class="cdd-speaker__body">
            <h3>${escapeHtml(speaker.name || '')}</h3>
            <p class="cdd-speaker__role">${escapeHtml(speaker.role || '')}${speaker.organization ? ` · ${escapeHtml(speaker.organization)}` : ''}</p>
            <p>${escapeHtml(speaker.description || '')}</p>
            <div class="cdd-speaker__links">
              ${socials.map((social) => `<a href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(social.label)}</a>`).join('')}
            </div>
          </div>
        </article>`;
      }).join('')}
    </div>
  </div>
</section>`;
};

const renderCommunity = (items, rootPath) => {
  const normalized = Array.isArray(items) ? items : [];

  if (!normalized.length) {
    return '';
  }

  return `
<section class="section cdd-community" aria-labelledby="cdd-community-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Community Building</p>
      <h2 id="cdd-community-title" class="section-header__title">What developers and students experienced through Dev Days.</h2>
    </div>
    <div class="cdd-community__grid" data-stagger>
      ${normalized.map((item) => `
      <article class="card cdd-community__card">
        <h3>${escapeHtml(item.title || '')}</h3>
        <p>${escapeHtml(item.description || '')}</p>
        ${item.linkHref ? `<a class="button button--text" href="${escapeHtml(toRootUrl(rootPath, item.linkHref))}">${escapeHtml(item.linkLabel || 'Learn more')} <span data-lucide="arrow-right"></span></a>` : ''}
      </article>`).join('')}
    </div>
  </div>
</section>`;
};

const renderMedia = (media, rootPath) => {
  const normalized = Array.isArray(media) ? media : [];

  if (!normalized.length) {
    return '';
  }

  return `
<section class="section cdd-media" aria-labelledby="cdd-media-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Media</p>
      <h2 id="cdd-media-title" class="section-header__title">Moments from GitHub Copilot Dev Days.</h2>
    </div>
    <div class="cdd-media__grid" data-stagger>
      ${normalized.map((item, index) => {
        const thumbnail = toRootUrl(rootPath, item.thumbnail || item.src);
        const label = item.type === 'video' ? 'Play highlight video' : 'Open full image';

        return `
        <article class="card cdd-media__item">
          <button class="cdd-media__button" type="button" data-cdd-media-index="${index}" data-cdd-media-type="${escapeHtml(item.type || 'image')}" aria-label="${escapeHtml(label)}">
            <img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(item.alt || 'Dev Days media moment')}" loading="lazy" decoding="async" />
            <span class="cdd-media__badge">${escapeHtml((item.type || 'image').toUpperCase())}</span>
          </button>
        </article>`;
      }).join('')}
    </div>
  </div>
</section>

<div class="modal modal--image cdd-modal" id="cdd-image-modal" aria-hidden="true" data-cdd-modal="image" role="dialog" aria-modal="true" aria-labelledby="cdd-image-modal-title">
  <div class="modal__overlay" data-cdd-modal-close></div>
  <div class="modal__dialog cdd-modal__dialog">
    <div class="modal__header">
      <h3 id="cdd-image-modal-title">Dev Days Image</h3>
      <button class="button button--ghost modal__close" type="button" data-cdd-modal-close aria-label="Close image lightbox"><span data-lucide="x"></span></button>
    </div>
    <div class="modal__body cdd-modal__body">
      <img data-cdd-modal-image src="" alt="" />
    </div>
  </div>
</div>

<div class="modal modal--video cdd-modal" id="cdd-video-modal" aria-hidden="true" data-cdd-modal="video" role="dialog" aria-modal="true" aria-labelledby="cdd-video-modal-title">
  <div class="modal__overlay" data-cdd-modal-close></div>
  <div class="modal__dialog cdd-modal__dialog">
    <div class="modal__header">
      <h3 id="cdd-video-modal-title">Dev Days Video</h3>
      <button class="button button--ghost modal__close" type="button" data-cdd-modal-close aria-label="Close video modal"><span data-lucide="x"></span></button>
    </div>
    <div class="modal__body cdd-modal__body">
      <iframe title="Dev Days video" data-cdd-modal-video src="" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
  </div>
</div>`;
};

const renderTestimonials = (testimonials, rootPath) => {
  if (!Array.isArray(testimonials) || !testimonials.length) {
    return '';
  }

  return `
<section class="section cdd-testimonials" aria-labelledby="cdd-testimonials-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">Testimonials</p>
      <h2 id="cdd-testimonials-title" class="section-header__title">Voices from the Dev Days experience.</h2>
    </div>
    <div class="cdd-testimonials__grid" data-stagger>
      ${testimonials.map((item) => `
      <article class="card cdd-testimonial">
        ${item.photo ? `<img src="${escapeHtml(toRootUrl(rootPath, item.photo))}" alt="${escapeHtml(item.name || 'Testimonial profile')}" loading="lazy" decoding="async" />` : ''}
        <blockquote>“${escapeHtml(item.quote || '')}”</blockquote>
        <p>${escapeHtml(item.name || '')}</p>
        <p class="cdd-testimonial__meta">${escapeHtml(item.role || '')}${item.organization ? ` · ${escapeHtml(item.organization)}` : ''}${item.edition ? ` · Dev Days ${escapeHtml(item.edition)}` : ''}</p>
      </article>`).join('')}
    </div>
  </div>
</section>`;
};

const renderPartnership = (series) => {
  const partners = Array.isArray(series?.partnershipSection?.partners) ? series.partnershipSection.partners : [];

  return `
<section class="section cdd-partnership" aria-labelledby="cdd-partnership-title">
  <div class="container container--wide">
    <article class="card cdd-partnership__card" data-animate="fade-up">
      <p class="section-header__eyebrow">Partnership</p>
      <h2 id="cdd-partnership-title">${escapeHtml(series?.partnershipSection?.title || 'Built with the Developer Ecosystem')}</h2>
      <p>${escapeHtml(series?.partnershipSection?.description || '')}</p>
      <ul class="cdd-partnership__list" aria-label="Ecosystem partners">
        ${partners.map((partner) => `<li>${escapeHtml(partner)}</li>`).join('')}
      </ul>
    </article>
  </div>
</section>`;
};

const renderBlogs = (posts, rootPath) => {
  if (!Array.isArray(posts) || !posts.length) {
    return '';
  }

  return `
<section class="section cdd-blogs" aria-labelledby="cdd-blogs-title">
  <div class="container container--wide">
    <div class="section-header" data-animate="fade-up">
      <p class="section-header__eyebrow">From Dev Days</p>
      <h2 id="cdd-blogs-title" class="section-header__title">Related stories and technical reflections.</h2>
    </div>
    <div class="cdd-blogs__grid" data-stagger>
      ${posts.map((post) => `
      <article class="card cdd-blog-card">
        <a class="cdd-blog-card__media" href="${escapeHtml(toRootUrl(rootPath, `blogs/${post.slug}/`))}" aria-label="Read article: ${escapeHtml(post.title)}">
          <img src="${escapeHtml(toRootUrl(rootPath, post.coverImage))}" alt="${escapeHtml(post.coverImageAlt || post.title)}" loading="lazy" decoding="async" />
        </a>
        <div class="cdd-blog-card__body">
          <p class="cdd-blog-card__chip">${escapeHtml(post.category || 'Blog')}</p>
          <h3><a href="${escapeHtml(toRootUrl(rootPath, `blogs/${post.slug}/`))}">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.excerpt || '')}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>`;
};

const renderCertificates = (certificateEventSlug, rootPath) => {
  if (!certificateEventSlug) {
    return '';
  }

  const href = `${toRootUrl(rootPath, 'certificates/')}?event=${encodeURIComponent(certificateEventSlug)}`;

  return `
<section class="section cdd-certificates" aria-labelledby="cdd-certificates-title">
  <div class="container container--wide">
    <article class="card cdd-certificates__card" data-animate="fade-up">
      <p class="section-header__eyebrow">Certificates</p>
      <h2 id="cdd-certificates-title">Need your participation certificate?</h2>
      <p>Access the HackUnion certificate portal and select this Dev Days edition where available.</p>
      <a class="button button--secondary" href="${escapeHtml(href)}">Go to Certificates <span data-lucide="arrow-right"></span></a>
    </article>
  </div>
</section>`;
};

const renderFinalCta = (series, rootPath) => `
<section class="section cdd-final-cta" aria-labelledby="cdd-final-cta-title">
  <div class="container container--wide">
    <article class="card cdd-final-cta__card" data-animate="fade-up">
      <p class="section-header__eyebrow">Next Edition</p>
      <h2 id="cdd-final-cta-title">${escapeHtml(series?.finalCta?.title || 'Build the Future with Us')}</h2>
      <p>${escapeHtml(series?.finalCta?.description || '')}</p>
      <div class="cdd-final-cta__actions">
        <a class="button button--primary" href="${escapeHtml(toRootUrl(rootPath, series?.finalCta?.primary?.href || 'copilot-dev-days/2.0/'))}">${escapeHtml(series?.finalCta?.primary?.label || 'Explore Dev Days 2.0')}</a>
        <a class="button button--secondary" href="${escapeHtml(toRootUrl(rootPath, series?.finalCta?.secondary?.href || 'socials/'))}">${escapeHtml(series?.finalCta?.secondary?.label || 'Join HackUnion')}</a>
      </div>
    </article>
  </div>
</section>`;

const renderNotFound = (rootPath) => `
<section class="section cdd-not-found" aria-labelledby="cdd-not-found-title">
  <div class="container container--wide">
    <article class="card cdd-not-found__card">
      <p class="section-header__eyebrow">Edition Not Found</p>
      <h1 id="cdd-not-found-title">This Dev Days edition is not available.</h1>
      <p>The edition route is invalid or not configured yet. Use the flagship page to explore available editions.</p>
      <a class="button button--primary" href="${escapeHtml(toRootUrl(rootPath, 'copilot-dev-days/'))}">Back to GitHub Copilot Dev Days</a>
    </article>
  </div>
</section>`;

const updateSchema = ({ mode, rootPath, series, edition }) => {
  const existing = document.querySelector('#cdd-jsonld');
  const script = existing || document.createElement('script');

  script.id = 'cdd-jsonld';
  script.type = 'application/ld+json';

  if (mode === 'edition' && edition) {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: edition.title,
      eventStatus: edition.status === 'current'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventCompleted',
      startDate: edition.date,
      description: edition.description,
      image: [toAbsoluteUrl(toRootUrl(rootPath, edition.coverImage))],
      location: {
        '@type': 'Place',
        name: edition.venue || 'HackUnion Venue',
        address: edition.location || 'Hyderabad'
      },
      organizer: {
        '@type': 'Organization',
        name: 'HackUnion',
        url: toAbsoluteUrl(toRootUrl(rootPath, ''))
      }
    };

    script.textContent = JSON.stringify(payload, null, 2);
  } else {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'EventSeries',
      name: series?.title || 'GitHub Copilot Dev Days',
      description: series?.tagline || '',
      organizer: {
        '@type': 'Organization',
        name: 'HackUnion',
        url: toAbsoluteUrl(toRootUrl(rootPath, ''))
      }
    };

    script.textContent = JSON.stringify(payload, null, 2);
  }

  if (!existing) {
    document.head.append(script);
  }
};

const getRelatedPosts = (blogsPayload, filters = {}, editionBlogs = {}) => {
  if (!blogsPayload?.posts?.length) {
    return [];
  }

  const fallbackSlugs = Array.isArray(filters.fallbackSlugs) ? filters.fallbackSlugs : [];
  const preferredSlugs = Array.isArray(editionBlogs.slugs) ? editionBlogs.slugs : [];
  const tags = new Set([
    ...(Array.isArray(filters.tags) ? filters.tags : []),
    ...(Array.isArray(editionBlogs.tags) ? editionBlogs.tags : [])
  ].map((tag) => String(tag).toLowerCase()));

  const categories = new Set([
    ...(Array.isArray(filters.categories) ? filters.categories : []),
    editionBlogs.category
  ].filter(Boolean).map((category) => String(category).toLowerCase()));

  const bySlug = preferredSlugs
    .map((slug) => blogsPayload.posts.find((post) => post.slug === slug))
    .filter(Boolean);

  const byTagOrCategory = blogsPayload.posts.filter((post) => {
    const postCategory = String(post.category || '').toLowerCase();
    const postTags = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).toLowerCase()) : [];

    if (categories.has(postCategory)) {
      return true;
    }

    return postTags.some((tag) => tags.has(tag));
  });

  const fallback = fallbackSlugs
    .map((slug) => blogsPayload.posts.find((post) => post.slug === slug))
    .filter(Boolean);

  return uniqueBySlug([...bySlug, ...byTagOrCategory, ...fallback]).slice(0, 3);
};

const setupMediaModals = (container, media, rootPath) => {
  const imageModal = container.querySelector('[data-cdd-modal="image"]');
  const videoModal = container.querySelector('[data-cdd-modal="video"]');
  const imageNode = container.querySelector('[data-cdd-modal-image]');
  const videoNode = container.querySelector('[data-cdd-modal-video]');

  if (!imageModal || !videoModal || !imageNode || !videoNode) {
    return;
  }

  let activeModal = null;
  let lastTrigger = null;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const closeModal = () => {
    if (!activeModal) {
      return;
    }

    activeModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
    videoNode.setAttribute('src', '');
    activeModal = null;
    lastTrigger?.focus();
  };

  const openModal = (modal) => {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
    activeModal = modal;
    const firstFocusable = modal.querySelector(focusableSelector);
    firstFocusable?.focus();
  };

  container.querySelectorAll('[data-cdd-media-index]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const mediaIndex = Number(trigger.getAttribute('data-cdd-media-index'));
      const item = media[mediaIndex];

      if (!item) {
        return;
      }

      lastTrigger = trigger;

      if (item.type === 'video' && item.embedUrl) {
        videoNode.setAttribute('src', item.embedUrl);
        openModal(videoModal);
        return;
      }

      imageNode.setAttribute('src', toRootUrl(rootPath, item.src || item.thumbnail));
      imageNode.setAttribute('alt', item.alt || 'Dev Days media image');
      openModal(imageModal);
    });
  });

  container.querySelectorAll('[data-cdd-modal-close]').forEach((trigger) => {
    trigger.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModal) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(activeModal.querySelectorAll(focusableSelector));

    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
};

const applyMetadata = (mode, series, edition, rootPath) => {
  if (mode === 'edition' && edition) {
    const url = toRootUrl(rootPath, `copilot-dev-days/${edition.slug}/`);
    setPageMetadata({
      title: `${edition.title} | HackUnion`,
      description: edition.description,
      image: toAbsoluteUrl(toRootUrl(rootPath, edition.coverImage)),
      url: toAbsoluteUrl(url)
    });

    return;
  }

  setPageMetadata({
    title: 'GitHub Copilot Dev Days | HackUnion',
    description: 'GitHub Copilot Dev Days is a recurring HackUnion flagship developer experience conducted with the broader ecosystem including Microsoft and GitHub.',
    image: toAbsoluteUrl(toRootUrl(rootPath, 'og/hackunion-home.svg')),
    url: toAbsoluteUrl(toRootUrl(rootPath, 'copilot-dev-days/'))
  });
};

const resolveEditionIdFromPath = () => {
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (!segments.length) {
    return '';
  }

  const last = segments[segments.length - 1];
  const previous = segments[segments.length - 2];

  if (last === 'index.html' && previous) {
    return previous;
  }

  return last;
};

export const initCopilotDevDays = async () => {
  const container = document.querySelector('[data-copilot-dev-days-app]');

  if (!container) {
    return;
  }

  const rootPath = document.body.dataset.siteRoot || '../';
  const mode = document.body.dataset.copilotDevDaysMode || 'series';
  const indexPath = document.body.dataset.devdaysIndexPath;
  const blogsIndexPath = document.body.dataset.blogIndexPath;

  if (!indexPath) {
    return;
  }

  try {
    const series = await fetchJson(toRootUrl(rootPath, indexPath));
    const summaries = Array.isArray(series.editions) ? series.editions : [];

    const editionMap = new Map();

    if (mode === 'series') {
      await Promise.all(summaries.map(async (summary) => {
        if (!summary?.dataPath) {
          return;
        }

        const data = await fetchJson(toRootUrl(rootPath, summary.dataPath));
        editionMap.set(summary.id, data);
      }));
    }

    if (mode === 'edition') {
      const editionId = document.body.dataset.devdaysEdition || resolveEditionIdFromPath();
      const summary = summaries.find((item) => item.id === editionId || item.slug === editionId);

      if (summary?.dataPath) {
        const data = await fetchJson(toRootUrl(rootPath, summary.dataPath));
        editionMap.set(summary.id, data);
      }
    }

    const currentEdition = editionMap.get(series.currentEditionId) || editionMap.get('2.0');
    const previousEdition = editionMap.get('1.0');

    if (mode === 'series') {
      let relatedPosts = [];

      if (blogsIndexPath) {
        const blogsPayload = await fetchJson(toRootUrl(rootPath, blogsIndexPath));
        relatedPosts = getRelatedPosts(blogsPayload, series.blogFilters, currentEdition?.blogs || {});
      }

      const rendered = [
        renderHero(series, rootPath),
        renderAbout(series),
        renderJourney(series),
        renderEditionSpotlight(currentEdition, rootPath),
        renderInside(currentEdition?.inside || series.insideItems || []),
        renderPreviousEdition(previousEdition, rootPath),
        renderEditions(series, summaries, rootPath),
        renderSpeakers(currentEdition?.speakers || [], rootPath),
        renderCommunity(currentEdition?.community || series.communityShowcase || [], rootPath),
        renderMedia(currentEdition?.media || [], rootPath),
        renderTestimonials(currentEdition?.testimonials || [], rootPath),
        renderPartnership(series),
        renderBlogs(relatedPosts, rootPath),
        renderCertificates(currentEdition?.certificateEventSlug, rootPath),
        renderFinalCta(series, rootPath)
      ].join('');

      container.innerHTML = rendered;

      applyMetadata('series', series, null, rootPath);
      updateSchema({ mode: 'series', rootPath, series, edition: null });

      const media = Array.isArray(currentEdition?.media) ? currentEdition.media : [];
      if (media.length) {
        setupMediaModals(container, media, rootPath);
      }

      await renderLucideIcons();
      initAnimations(document.body.dataset.page || 'shared');
      return;
    }

    const editionId = document.body.dataset.devdaysEdition || resolveEditionIdFromPath();
    const selectedSummary = summaries.find((item) => item.id === editionId || item.slug === editionId);
    const selectedEdition = selectedSummary ? editionMap.get(selectedSummary.id) : null;

    if (!selectedEdition) {
      container.innerHTML = renderNotFound(rootPath);
      await renderLucideIcons();
      initAnimations(document.body.dataset.page || 'shared');
      return;
    }

    let relatedPosts = [];
    if (blogsIndexPath) {
      const blogsPayload = await fetchJson(toRootUrl(rootPath, blogsIndexPath));
      relatedPosts = getRelatedPosts(blogsPayload, series.blogFilters, selectedEdition.blogs || {});
    }

    const editionRendered = [
      renderHero(series, rootPath),
      renderEditionSpotlight(selectedEdition, rootPath),
      renderAbout(series),
      renderJourney(series),
      renderInside(selectedEdition.inside || series.insideItems || []),
      renderCommunity(selectedEdition.community || [], rootPath),
      renderMedia(selectedEdition.media || [], rootPath),
      renderSpeakers(selectedEdition.speakers || [], rootPath),
      renderTestimonials(selectedEdition.testimonials || [], rootPath),
      renderBlogs(relatedPosts, rootPath),
      renderCertificates(selectedEdition.certificateEventSlug, rootPath),
      renderEditions(series, summaries, rootPath),
      renderFinalCta(series, rootPath)
    ].join('');

    container.innerHTML = editionRendered;

    applyMetadata('edition', series, selectedEdition, rootPath);
    updateSchema({ mode: 'edition', rootPath, series, edition: selectedEdition });

    const media = Array.isArray(selectedEdition.media) ? selectedEdition.media : [];
    if (media.length) {
      setupMediaModals(container, media, rootPath);
    }

    await renderLucideIcons();
    initAnimations(document.body.dataset.page || 'shared');
  } catch (error) {
    container.innerHTML = `
      <section class="section cdd-not-found" aria-labelledby="cdd-data-error-title">
        <div class="container container--wide">
          <article class="card cdd-not-found__card">
            <p class="section-header__eyebrow">Data Error</p>
            <h1 id="cdd-data-error-title">GitHub Copilot Dev Days content is unavailable.</h1>
            <p>Please refresh this page. If the issue continues, verify Dev Days content files in the public data directory.</p>
          </article>
        </div>
      </section>`;
  }
};
