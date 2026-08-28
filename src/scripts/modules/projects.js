import { projectsData, projectFilters } from '../data/projects-data.js';
import { setPageMetadata } from '../services/seo.js';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const normalizeSlug = (value = '') => String(value).trim().toLowerCase();

const toTitleCase = (value = '') => value
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const getInitials = (title = '') => title
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((chunk) => chunk.charAt(0).toUpperCase())
  .join('');

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

const buildProjectLinks = (project, baseLabel = 'View project') => {
  const links = [];

  if (project.githubUrl) {
    links.push({ label: 'GitHub', href: project.githubUrl, icon: 'github', external: true });
  }

  if (project.demoUrl) {
    links.push({ label: 'Live Demo', href: project.demoUrl, icon: 'monitor-up', external: true });
  }

  if (project.caseStudyUrl) {
    links.push({ label: baseLabel, href: project.caseStudyUrl, icon: 'arrow-up-right', external: false });
  }

  return links;
};

const renderProjectVisual = (project, loading = 'lazy') => {
  if (project.image) {
    return `
      <img class="project-card__image" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt || project.title)}" loading="${loading}" decoding="async" />
    `;
  }

  return `
    <div class="project-card__image-fallback" role="img" aria-label="Generated visual for ${escapeHtml(project.title)}">
      <span class="project-card__fallback-grid" aria-hidden="true"></span>
      <span class="project-card__fallback-initials">${escapeHtml(getInitials(project.title))}</span>
      <span class="project-card__fallback-category">${escapeHtml(project.category)}</span>
      <span class="project-card__fallback-meta">${escapeHtml(project.status)} · ${escapeHtml(formatDate(project.date))}</span>
    </div>
  `;
};

const renderActionLink = (action, title) => {
  const rel = action.external ? 'noreferrer noopener' : '';
  const target = action.external ? '_blank' : '_self';

  return `
    <a class="project-card__action" href="${escapeHtml(action.href)}" target="${target}"${rel ? ` rel="${rel}"` : ''} aria-label="${escapeHtml(action.label)} for ${escapeHtml(title)}">
      <span data-lucide="${escapeHtml(action.icon)}" aria-hidden="true"></span>
      <span>${escapeHtml(action.label)}</span>
    </a>
  `;
};

const renderStack = (technologies = []) => technologies
  .map((item) => `<li class="project-card__stack-chip">${escapeHtml(item)}</li>`)
  .join('');

const renderProjectCard = (project, index) => {
  const actions = buildProjectLinks(project, 'Case Study');
  const overlayAction = actions[0] ?? { label: 'Details', href: project.caseStudyUrl || '#', icon: 'arrow-up-right', external: !project.caseStudyUrl };
  const cardClasses = ['card', 'project-card'];

  return `
    <article class="${cardClasses.join(' ')}" data-project-card data-project-filter="${escapeHtml(project.filter || 'all')}" aria-labelledby="${escapeHtml(project.slug)}-title">
      <a class="project-card__visual" href="${escapeHtml(project.caseStudyUrl || '#')}" aria-label="View project: ${escapeHtml(project.title)}">
        ${renderProjectVisual(project, index < 2 ? 'eager' : 'lazy')}
        <span class="project-card__visual-frame" aria-hidden="true"></span>
        <span class="project-card__index" aria-hidden="true">P-${escapeHtml(String(index + 1).padStart(2, '0'))}</span>
        <span class="project-card__status" aria-label="Status: ${escapeHtml(project.status)}">
          <span class="project-card__status-dot" aria-hidden="true"></span>
          <span>${escapeHtml(project.status)}</span>
        </span>
        <span class="project-card__hover-action">
          <span data-lucide="${escapeHtml(overlayAction.icon)}" aria-hidden="true"></span>
          <span>${escapeHtml(overlayAction.label)}</span>
        </span>
      </a>

      <div class="project-card__body">
        <p class="project-card__category">${escapeHtml(project.category)}</p>
        <h3 id="${escapeHtml(project.slug)}-title" class="project-card__title">${escapeHtml(project.title)}</h3>
        <p class="project-card__description">${escapeHtml(project.description)}</p>

        <p class="project-card__builders"><span>Built by</span> ${escapeHtml(project.builders.join(', '))}</p>

        <ul class="project-card__stack" aria-label="Technology stack for ${escapeHtml(project.title)}">
          ${renderStack(project.technologies)}
        </ul>

        <div class="project-card__actions" aria-label="Project links for ${escapeHtml(project.title)}">
          ${actions.map((action) => renderActionLink(action, project.title)).join('')}
        </div>
      </div>
    </article>
  `;
};

const renderFilterButton = (filter, activeFilter) => `
  <button class="projects-showcase__filter${filter.id === activeFilter ? ' is-active' : ''}" type="button" data-project-filter-control="${escapeHtml(filter.id)}" aria-pressed="${filter.id === activeFilter ? 'true' : 'false'}">
    ${escapeHtml(filter.label)}
  </button>
`;

const renderProjectList = (projects, gridTarget) => {
  if (!gridTarget) {
    return;
  }

  if (!projects.length) {
    gridTarget.innerHTML = '<article class="card projects-showcase__empty"><h3>No projects in this filter yet.</h3><p>Try a different category to explore more community builds.</p></article>';
    return;
  }

  gridTarget.innerHTML = projects.map((project, index) => renderProjectCard(project, index)).join('');
};

const renderProjectsSection = (section) => {
  const filtersTarget = section.querySelector('[data-project-filters]');
  const gridTarget = section.querySelector('[data-project-grid]');
  const orderedProjects = [...projectsData].sort((a, b) => Number(b.featured) - Number(a.featured));
  const state = { activeFilter: 'all' };

  const getFilteredProjects = () => {
    if (state.activeFilter === 'all') {
      return orderedProjects;
    }

    return orderedProjects.filter((project) => project.filter === state.activeFilter);
  };

  const renderAll = () => {
    if (filtersTarget) {
      filtersTarget.innerHTML = projectFilters.map((filter) => renderFilterButton(filter, state.activeFilter)).join('');
    }

    renderProjectList(getFilteredProjects(), gridTarget);
  };

  filtersTarget?.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-project-filter-control]');

    if (!trigger) {
      return;
    }

    const nextFilter = trigger.getAttribute('data-project-filter-control') || 'all';

    if (nextFilter === state.activeFilter) {
      return;
    }

    state.activeFilter = nextFilter;
    renderAll();
  });

  renderAll();
};

const renderDetailActions = (project) => {
  const actions = buildProjectLinks(project, 'View Project');

  if (!actions.length) {
    return '';
  }

  return actions.map((action) => `
    <a class="button ${action.external ? 'button--secondary' : 'button--primary'}" href="${escapeHtml(action.href)}"${action.external ? ' target="_blank" rel="noreferrer noopener"' : ''}>
      <span data-lucide="${escapeHtml(action.icon)}" aria-hidden="true"></span>
      <span>${escapeHtml(action.label)}</span>
    </a>
  `).join('');
};

const renderScreenshot = (item, projectTitle, index) => `
  <figure class="project-detail__shot card">
    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || `${projectTitle} screenshot ${index + 1}`)}" loading="lazy" decoding="async" />
  </figure>
`;

const renderRelatedProject = (project) => `
  <a class="project-detail__related-card card" href="../../projects/${escapeHtml(project.slug)}/">
    <p class="project-detail__related-category">${escapeHtml(project.category)}</p>
    <h3>${escapeHtml(project.title)}</h3>
    <p>${escapeHtml(project.description)}</p>
  </a>
`;

const initProjectDetailPage = (detailNode) => {
  const slug = normalizeSlug(detailNode.dataset.projectSlug || '');
  const project = projectsData.find((item) => item.slug === slug);

  if (!project) {
    detailNode.innerHTML = '<article class="card projects-showcase__empty"><h2>Project not found</h2><p>This project link is no longer available.</p><a class="button button--primary" href="../../">Back to Home</a></article>';
    return;
  }

  const relatedProjects = projectsData.filter((item) => (project.relatedProjectIds || []).includes(item.id)).slice(0, 3);
  const screenshotItems = project.screenshots?.length
    ? project.screenshots
    : [{ image: '../../Images/gallery/2SP00516.jpg', alt: `${project.title} preview` }];

  const detailMarkup = `
    <section class="section project-detail__hero" aria-labelledby="project-detail-title">
      <div class="container container--wide project-detail__hero-inner" data-animate>
        <p class="section-header__eyebrow">Built by the community</p>
        <h1 id="project-detail-title" class="project-detail__title">${escapeHtml(project.title)}</h1>
        <p class="project-detail__description">${escapeHtml(project.description)}</p>

        <div class="project-detail__meta" aria-label="Project metadata">
          <p><span>Category</span><strong>${escapeHtml(project.category)}</strong></p>
          <p><span>Status</span><strong>${escapeHtml(project.status)}</strong></p>
          <p><span>Date</span><strong>${escapeHtml(formatDate(project.date))}</strong></p>
          <p><span>Built by</span><strong>${escapeHtml(project.builders.join(', '))}</strong></p>
        </div>

        <div class="project-detail__actions">${renderDetailActions(project)}</div>
      </div>
    </section>

    <section class="section section--compact" aria-label="Project cover">
      <div class="container container--wide">
        <div class="project-detail__cover card">
          ${project.image ? `<img src="../../${escapeHtml(project.image.replace(/^\.\//, ''))}" alt="${escapeHtml(project.imageAlt || project.title)}" loading="eager" decoding="async" />` : `<div class="project-card__image-fallback" role="img" aria-label="Generated visual for ${escapeHtml(project.title)}"><span class="project-card__fallback-grid" aria-hidden="true"></span><span class="project-card__fallback-initials">${escapeHtml(getInitials(project.title))}</span><span class="project-card__fallback-category">${escapeHtml(project.category)}</span><span class="project-card__fallback-meta">${escapeHtml(project.status)} · ${escapeHtml(formatDate(project.date))}</span></div>`}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="project-overview-title">
      <div class="container container--wide project-detail__content-grid">
        <article class="card project-detail__content-card" data-animate>
          <h2 id="project-overview-title">Overview</h2>
          <p>${escapeHtml(project.overview || project.description)}</p>
        </article>

        <article class="card project-detail__content-card" data-animate>
          <h2>How It Was Built</h2>
          <p>${escapeHtml(project.howItWasBuilt || 'Built through community collaboration and iterative delivery sprints.')}</p>
        </article>

        <article class="card project-detail__content-card" data-animate>
          <h2>Challenges</h2>
          <p>${escapeHtml(project.challenges || 'Execution constraints were managed through mentor reviews and builder checkpoints.')}</p>
        </article>

        <article class="card project-detail__content-card" data-animate>
          <h2>Outcome</h2>
          <p>${escapeHtml(project.outcome || 'The project moved from concept to working output with measurable community value.')}</p>
        </article>
      </div>
    </section>

    <section class="section section--compact" aria-labelledby="project-tech-title">
      <div class="container container--wide" data-animate>
        <article class="card project-detail__stack-card">
          <h2 id="project-tech-title">Technologies</h2>
          <ul class="project-detail__stack-list">${renderStack(project.technologies)}</ul>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="project-shots-title">
      <div class="container container--wide">
        <div class="section-header" data-animate>
          <p class="section-header__eyebrow">Screenshots</p>
          <h2 id="project-shots-title" class="section-header__title">Project Views</h2>
        </div>
        <div class="project-detail__shots" data-stagger>
          ${screenshotItems.map((item, index) => renderScreenshot(item, project.title, index)).join('')}
        </div>
      </div>
    </section>

    <section class="section section--compact" aria-labelledby="related-projects-title">
      <div class="container container--wide">
        <div class="section-header" data-animate>
          <p class="section-header__eyebrow">Related Builds</p>
          <h2 id="related-projects-title" class="section-header__title">Related Projects</h2>
        </div>
        <div class="project-detail__related" data-stagger>
          ${relatedProjects.map((item) => renderRelatedProject(item)).join('')}
        </div>
      </div>
    </section>
  `;

  detailNode.innerHTML = detailMarkup;

  setPageMetadata({
    title: `${project.title} | HackUnion Projects`,
    description: project.description,
    image: project.image ? `https://hackunion.in/${project.image.replace(/^\.\//, '')}` : 'https://hackunion.in/og/hackunion-home.svg',
    url: `https://hackunion.in/projects/${project.slug}/`
  });
};

export const initProjects = () => {
  const projectsSection = document.querySelector('[data-projects-section]');
  const detailNode = document.querySelector('[data-project-detail]');

  if (projectsSection) {
    renderProjectsSection(projectsSection);
  }

  if (detailNode) {
    initProjectDetailPage(detailNode);
  }
};
