import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { getValidatedBlogSources, slugify } from './blogs-content.mjs';

const projectRoot = process.cwd();
const blogsDir = path.join(projectRoot, 'blogs');
const publicDataDir = path.join(projectRoot, 'public', 'data', 'blogs');
const publicDataIndexFile = path.join(projectRoot, 'public', 'data', 'blogs-index.json');
const sitemapFile = path.join(projectRoot, 'public', 'sitemap.xml');

const site = {
  title: 'HackUnion',
  description: 'A builder-first technology community for developers, designers, AI engineers, founders, and open source contributors.',
  baseUrl: 'https://vasay.github.io/HU-New/'
};

const defaultCategories = [
  'Technology',
  'Building',
  'Open Source',
  'Community',
  'Events',
  'Tutorials',
  'Announcements',
  'Career',
  'Stories'
];

const staticSitemapRoutes = [
  '',
  'about/',
  'openbuildweek/',
  'copilot-dev-days/',
  'copilot-dev-days/1.0/',
  'copilot-dev-days/2.0/',
  'obw/',
  'brand-kit/',
  'organizers/',
  'socials/',
  'certificates/',
  'certificate/',
  'coc/',
  'blogs/'
];

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const cleanAssetPath = (value = '') => String(value)
  .trim()
  .replace(/^\.\//, '')
  .replace(/^\//, '');

const estimateReadingTime = (markdownBody) => {
  const words = markdownBody
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
};

const stripLeadingH1 = (html) => html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');

const preprocessEmbeds = (markdown) => markdown.replace(/@\[youtube\]\(([^)]+)\)/g, (_, rawUrl) => {
  const input = rawUrl.trim();
  const idMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) || input.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  const videoId = idMatch ? idMatch[1] : input;
  const src = `https://www.youtube.com/embed/${videoId}`;

  return `\n<div class="blog-prose__video"><iframe src="${src}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;
});

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false
});

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  const title = token.attrGet('title');
  const alt = self.renderInlineAsText(token.children || [], options, env);
  const escapedAlt = markdown.utils.escapeHtml(alt);
  const escapedSrc = markdown.utils.escapeHtml(src);

  if (!title) {
    return `<img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" decoding="async" />`;
  }

  const escapedCaption = markdown.utils.escapeHtml(title);
  return `<figure class="blog-prose__figure"><img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" decoding="async" /><figcaption>${escapedCaption}</figcaption></figure>`;
};

markdown.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const level = Number(token.tag.replace('h', ''));
  const textToken = tokens[idx + 1];
  const headingText = textToken?.content || '';
  const id = slugify(headingText);

  token.attrSet('id', id);

  if (level === 2 || level === 3) {
    env.toc = env.toc || [];
    env.toc.push({ id, title: headingText, level });
  }

  return self.renderToken(tokens, idx, options);
};

const readBlogPosts = () => {
  const sources = getValidatedBlogSources({ strictAssets: true });

  return sources.map((source) => {
    const env = { toc: [] };
    const html = markdown.render(preprocessEmbeds(source.markdownContent), env);
    const contentHtml = stripLeadingH1(html);

    const readingTime = source.readingTime || estimateReadingTime(source.markdownContent);

    return {
      slug: source.slug,
      title: source.title,
      excerpt: source.excerpt,
      category: source.category,
      tags: source.tags,
      featured: source.featured,
      readingTime,
      contentHtml,
      toc: env.toc,
      coverImage: cleanAssetPath(source.coverImage),
      coverImageAlt: source.coverImageAlt,
      coverImagePosition: source.coverImagePosition,
      author: source.author,
      publishedDateISO: source.publishedDateISO,
      updatedDateISO: source.updatedDateISO,
      publishedDateLabel: source.publishedDateLabel,
      updatedDateLabel: source.updatedDateLabel
    };
  }).sort((a, b) => new Date(b.publishedDateISO).getTime() - new Date(a.publishedDateISO).getTime());
};

const toCanonical = (routePath) => new URL(routePath, site.baseUrl).href;

const buildHeader = (depthPrefix, options = {}) => {
  const blogsCurrent = options.blogsCurrent ? ' aria-current="page"' : '';

  return `
<header class="site-header" data-site-header>
  <div class="container site-header__inner">
    <a class="brand" href="${depthPrefix}" aria-label="HackUnion home">
      <img class="brand__logo" src="${depthPrefix}Images/HackUnion-Logo.png" alt="HackUnion logo" width="88" height="88" />
      <span class="brand__lockup">
        <span class="brand__text">HackUnion</span>
        <span class="brand__meta">Builder-first technology community</span>
      </span>
    </a>

    <nav class="site-nav" id="site-navigation" aria-label="Primary" data-site-nav>
      <ul class="site-nav__list">
        <li><a class="site-nav__link" href="${depthPrefix}">Home</a></li>
        <li><a class="site-nav__link" href="${depthPrefix}about/">About</a></li>
        <li><a class="site-nav__link site-nav__link--highlight" href="${depthPrefix}openbuildweek/">OpenBuild Week</a></li>
        <li><a class="site-nav__link" href="${depthPrefix}certificates/">Certificates</a></li>
        <li><a class="site-nav__link" href="${depthPrefix}blogs/"${blogsCurrent}>Blogs</a></li>
      </ul>
      <div class="site-nav__mobile-actions">
        <button class="theme-toggle theme-toggle--mobile button button--ghost" type="button" aria-label="Activate dark theme" aria-pressed="false" data-theme-toggle>
          <span class="theme-toggle__glyph" aria-hidden="true">
            <span class="theme-toggle__sun"></span>
            <span class="theme-toggle__moon"></span>
          </span>
          <span class="theme-toggle__text" data-theme-toggle-text>Dark mode</span>
        </button>
        <a class="button button--primary" href="${depthPrefix}socials/">Join Community</a>
      </div>
    </nav>

    <div class="site-header__actions">
      <button class="theme-toggle button button--ghost" type="button" aria-label="Activate dark theme" aria-pressed="false" data-theme-toggle>
        <span class="theme-toggle__glyph" aria-hidden="true">
          <span class="theme-toggle__sun"></span>
          <span class="theme-toggle__moon"></span>
        </span>
        <span class="theme-toggle__text" data-theme-toggle-text>Dark mode</span>
      </button>
      <a class="button button--primary site-header__cta" href="${depthPrefix}socials/">Join Community</a>
    </div>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation menu" data-nav-toggle>
      <span class="nav-toggle__box" aria-hidden="true">
        <span class="nav-toggle__line"></span>
        <span class="nav-toggle__line"></span>
        <span class="nav-toggle__line"></span>
      </span>
      <span class="nav-toggle__label">
        <span class="nav-toggle__label-menu">Menu</span>
        <span class="nav-toggle__label-close" aria-hidden="true">Close</span>
      </span>
    </button>
  </div>
</header>`;
};

const buildFooter = (depthPrefix, emailId) => `
<footer class="site-footer" data-site-footer>
  <div class="container site-footer__inner">
    <div class="site-footer__top">
      <div class="site-footer__brand-column">
        <a class="brand site-footer__brand-link" href="${depthPrefix}" aria-label="HackUnion home">
          <img class="brand__logo" src="${depthPrefix}Images/HackUnion-Logo.png" alt="HackUnion logo" width="88" height="88" />
          <span class="brand__lockup">
            <span class="brand__text">HackUnion</span>
            <span class="brand__meta">Builder-first technology community</span>
          </span>
        </a>
        <p class="site-footer__description">HackUnion is a builder-first technology community where students and developers learn by building, collaborate in public, and grow through real work.</p>
        <div class="site-footer__socials" aria-label="HackUnion social links">
          <a class="site-footer__social-link" href="https://github.com/vasay/HU-New" target="_blank" rel="noreferrer" aria-label="HackUnion on GitHub"><span data-lucide="github"></span></a>
          <a class="site-footer__social-link" href="https://www.linkedin.com/company/hackunion-in/" target="_blank" rel="noreferrer" aria-label="HackUnion on LinkedIn"><span data-lucide="linkedin"></span></a>
          <a class="site-footer__social-link" href="https://x.com" target="_blank" rel="noreferrer" aria-label="HackUnion on X"><span data-lucide="twitter"></span></a>
          <a class="site-footer__social-link" href="mailto:hackunion17@gmail.com" aria-label="Email HackUnion"><span data-lucide="mail"></span></a>
        </div>
      </div>

      <div class="site-footer__links-grid">
        <section class="site-footer__column" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" class="site-footer__title">Navigation</h2>
          <nav class="site-footer__nav" aria-label="Footer navigation">
            <ul class="site-footer__list">
              <li><a href="${depthPrefix}">Home</a></li>
              <li><a href="${depthPrefix}about/">About</a></li>
              <li><a href="${depthPrefix}blogs/">Blogs</a></li>
              <li><a href="${depthPrefix}openbuildweek/">OpenBuild Week</a></li>
              <li><a href="${depthPrefix}certificates/">Certificates</a></li>
              <li><a href="${depthPrefix}socials/">Socials</a></li>
            </ul>
          </nav>
        </section>

        <section class="site-footer__column" aria-labelledby="footer-resources-title">
          <h2 id="footer-resources-title" class="site-footer__title">Resources</h2>
          <ul class="site-footer__list">
            <li><a href="${depthPrefix}brand-kit/">Brand Kit</a></li>
            <li><a href="${depthPrefix}organizers/">Organizers</a></li>
            <li><a href="${depthPrefix}coc/">Code of Conduct</a></li>
            <li><a href="https://github.com/vasay/HU-New" target="_blank" rel="noreferrer">GitHub Repository</a></li>
          </ul>
        </section>

        <section class="site-footer__column" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title" class="site-footer__title">Contact</h2>
          <ul class="site-footer__list site-footer__list--contact">
            <li><a href="mailto:hackunion17@gmail.com">hackunion17@gmail.com</a></li>
            <li><a href="mailto:hackunion17@gmail.com?subject=HackUnion%20Partnership">Partnership inquiries</a></li>
            <li><a href="mailto:hackunion17@gmail.com?subject=HackUnion%20Community%20Support">Community support</a></li>
          </ul>
        </section>
      </div>
    </div>

    <div class="site-footer__middle">
      <form class="site-footer__newsletter" data-footer-newsletter-form aria-label="Subscribe to HackUnion newsletter" novalidate>
        <div class="site-footer__newsletter-copy">
          <h2 class="site-footer__title">Builder updates in your inbox</h2>
          <p class="site-footer__newsletter-text">Receive event announcements, builder stories, and resource updates.</p>
        </div>
        <div class="site-footer__newsletter-row">
          <label class="site-footer__newsletter-label" for="${emailId}">Email address</label>
          <div class="site-footer__newsletter-controls">
            <input id="${emailId}" name="email" class="site-footer__newsletter-input" type="email" inputmode="email" autocomplete="email" placeholder="you@domain.com" required />
            <button class="button button--primary" type="submit">Subscribe</button>
          </div>
          <p class="site-footer__newsletter-note">Privacy-first. No spam, only high-signal HackUnion updates.</p>
          <p class="site-footer__newsletter-status" data-footer-newsletter-status aria-live="polite"></p>
        </div>
      </form>

      <div class="site-footer__utilities">
        <button class="theme-toggle button button--ghost site-footer__theme-toggle" type="button" aria-label="Activate dark theme" aria-pressed="false" data-theme-toggle>
          <span class="theme-toggle__glyph" aria-hidden="true">
            <span class="theme-toggle__sun"></span>
            <span class="theme-toggle__moon"></span>
          </span>
          <span class="theme-toggle__text" data-theme-toggle-text>Dark mode</span>
        </button>
        <a class="button button--secondary site-footer__repo-link" href="https://github.com/vasay/HU-New" target="_blank" rel="noreferrer">
          <span data-lucide="github" aria-hidden="true"></span>
          <span>View Repository</span>
        </a>
        <button class="button button--ghost site-footer__back-to-top" type="button" data-back-to-top aria-label="Back to top">
          <span data-lucide="arrow-up"></span>
          <span>Back to Top</span>
        </button>
      </div>
    </div>

    <div class="site-footer__bottom">
      <p class="site-footer__copyright">&copy; <span data-footer-year></span> HackUnion. All rights reserved.</p>
      <nav class="site-footer__legal" aria-label="Legal links">
        <ul class="site-footer__legal-list">
          <li><a href="${depthPrefix}coc/">Code of Conduct</a></li>
          <li><a href="${depthPrefix}brand-kit/">Brand Usage</a></li>
          <li><a href="mailto:hackunion17@gmail.com">Contact</a></li>
        </ul>
      </nav>
      <p class="site-footer__signature">Built with love by HackUnion.</p>
    </div>
  </div>
</footer>`;

const renderTagLinks = (tags, prefix) => tags.map((tag) => (
  `<a class="blog-tag" href="${prefix}?tag=${encodeURIComponent(tag)}">${tag}</a>`
)).join('');

const renderAuthorSocials = (socials) => {
  if (!socials.length) {
    return '';
  }

  return `<div class="blog-author__socials" aria-label="Author social links">${socials.map((item) => (
    `<a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}"><span data-lucide="${item.icon}"></span></a>`
  )).join('')}</div>`;
};

const renderToc = (toc) => {
  if (!toc.length) {
    return '<p class="blog-toc__empty">No sections available.</p>';
  }

  return `<ol class="blog-toc__list">${toc.map((item) => (
    `<li class="blog-toc__item blog-toc__item--level-${item.level}"><a href="#${item.id}">${item.title}</a></li>`
  )).join('')}</ol>`;
};

const renderRelatedCards = (related) => related.map((post) => `
<article class="card blog-related-card" data-hover="card">
  <a class="blog-related-card__media blog-image-holder" style="--blog-image-ratio: 16 / 10; --blog-image-position: ${post.coverImagePosition};" href="../${post.slug}/" aria-label="Read ${post.title}">
    <img src="../../${post.coverImage}" alt="${post.coverImageAlt}" loading="lazy" decoding="async" />
  </a>
  <div class="blog-related-card__body">
    <p class="blog-chip">${post.category}</p>
    <h3><a href="../${post.slug}/">${post.title}</a></h3>
    <p>${post.excerpt}</p>
    <div class="blog-meta blog-meta--compact">
      <span>${post.author.name}</span>
      <span>${post.publishedDateLabel}</span>
      <span>${post.readingTime}</span>
    </div>
  </div>
</article>
`).join('');

const renderMobileNextLink = (post) => {
  if (!post) {
    return '<p class="blog-nav-link blog-nav-link--disabled">No next article yet.</p>';
  }

  return `<a class="blog-nav-link" href="../${post.slug}/"><span>Next Article</span><strong>${post.title}</strong></a>`;
};

const renderIndexHtml = () => {
  const title = 'HackUnion Blogs | Stories, Ideas & Insights';
  const description = 'Stories, ideas, tutorials, and lessons from technology, building, community, open source, events, and projects across HackUnion.';
  const canonical = toCanonical('blogs/');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${toCanonical('og/hackunion-home.svg')}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${toCanonical('og/hackunion-home.svg')}" />
    <link rel="stylesheet" href="../styles/site.css" />
    <link rel="manifest" href="../manifest.webmanifest" />
    <link rel="icon" href="../favicon_io/HU/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon_io/HU/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon_io/HU/favicon-16x16.png" />
    <title>${title}</title>
  </head>
  <body
    class="blogs-page"
    data-page="blogs-index"
    data-seo-title="${title}"
    data-seo-description="${description}"
    data-seo-image="${toCanonical('og/hackunion-home.svg')}"
    data-seo-url="${canonical}"
    data-blog-index-path="../data/blogs-index.json"
    data-blog-root-path="../"
  >
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-shell">
      ${buildHeader('../', { blogsCurrent: true })}

      <main id="main-content" class="site-main blogs-main">
        <section class="hero section blogs-hero" aria-labelledby="blogs-hero-title">
          <div class="hero__backdrop" aria-hidden="true"></div>
          <div class="container container--wide blogs-hero__inner">
            <div class="stack stack--lg" data-animate="fade-up">
              <p class="eyebrow hero__eyebrow">HackUnion Blogs</p>
              <h1 id="blogs-hero-title" class="hero__title">Stories, Ideas &amp; Insights from HackUnion</h1>
              <p class="hero__text">The HackUnion blog explores technology, building, community, open source, events, projects, and practical lessons from builders across the ecosystem.</p>
            </div>
          </div>
        </section>

        <section class="section section--compact blogs-discovery" aria-labelledby="blog-discovery-title">
          <div class="container container--wide">
            <div class="section-header" data-animate="fade-up">
              <p class="section-header__eyebrow">Discover</p>
              <h2 id="blog-discovery-title" class="section-header__title">Find your next read</h2>
            </div>

            <form class="blogs-controls card" role="search" aria-label="Search HackUnion blogs" data-animate="fade-up">
              <div class="blogs-controls__field blogs-controls__field--search">
                <label class="blogs-controls__search-label" for="blog-search-input">Search posts</label>
                <input id="blog-search-input" class="blogs-controls__search" type="search" placeholder="Search by title, excerpt, category, or tag" data-blog-search />
              </div>

              <div class="blogs-controls__field blogs-controls__field--sort">
                <label class="blogs-controls__sort-label" for="blog-sort-select">Sort by</label>
                <select id="blog-sort-select" class="blogs-controls__sort" data-blog-sort>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="relevant">Most Relevant</option>
                </select>
              </div>

              <div class="blogs-controls__categories" data-blog-categories role="group" aria-label="Filter by category"></div>
              <div class="blogs-controls__themes" data-blog-theme-controls role="group" aria-label="Choose visual style">
                <p class="blogs-controls__themes-label">Visual Style</p>
                <div class="blogs-controls__themes-buttons">
                  <button class="blogs-controls__theme-chip is-active" type="button" data-blog-theme="tech">Tech Grid</button>
                  <button class="blogs-controls__theme-chip" type="button" data-blog-theme="editorial">Editorial Flux</button>
                </div>
              </div>
              <p class="blogs-controls__result" data-blog-result-text aria-live="polite"></p>
            </form>
          </div>
        </section>

        <section class="section blogs-featured" aria-labelledby="blogs-featured-title">
          <div class="container container--wide">
            <div class="section-header" data-animate="fade-up">
              <p class="section-header__eyebrow">Featured</p>
              <h2 id="blogs-featured-title" class="section-header__title">Latest featured article</h2>
            </div>
            <div data-blog-featured></div>
          </div>
        </section>

        <section class="blogs-divider" aria-hidden="true">
          <div class="container container--wide">
            <div class="blogs-divider__line" data-animate="fade-up">
              <span class="blogs-divider__label">Live Feed</span>
            </div>
          </div>
        </section>

        <section class="section blogs-grid-section" aria-labelledby="blogs-grid-title">
          <div class="container container--wide">
            <div class="section-header" data-animate="fade-up">
              <p class="section-header__eyebrow">All posts</p>
              <h2 id="blogs-grid-title" class="section-header__title">Stories from the ecosystem</h2>
            </div>
            <div class="blogs-grid" data-blog-grid data-stagger></div>
            <div class="blogs-empty card" data-blog-empty hidden>
              <h3>No articles match your filters.</h3>
              <p>Try a different search term, category, or tag.</p>
            </div>
          </div>
        </section>
      </main>

      ${buildFooter('../', 'blog-index-email')}
    </div>

    <script type="module" src="../src/scripts/main.js"></script>
  </body>
</html>`;
};

const renderArticleHtml = (post, context) => {
  const title = `${post.title} | HackUnion Blog`;
  const canonicalPath = `blogs/${post.slug}/`;
  const canonical = toCanonical(canonicalPath);
  const ogImage = toCanonical(post.coverImage);
  const prevLink = context.previous
    ? `<a class="blog-nav-link" href="../${context.previous.slug}/"><span>Previous Article</span><strong>${context.previous.title}</strong></a>`
    : '<span class="blog-nav-link blog-nav-link--disabled" aria-disabled="true"><span>Previous Article</span><strong>None</strong></span>';
  const nextLink = context.next
    ? `<a class="blog-nav-link" href="../${context.next.slug}/"><span>Next Article</span><strong>${context.next.title}</strong></a>`
    : '<span class="blog-nav-link blog-nav-link--disabled" aria-disabled="true"><span>Next Article</span><strong>None</strong></span>';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [ogImage],
    author: {
      '@type': 'Person',
      name: post.author.name,
      description: post.author.bio,
      image: toCanonical(post.author.image)
    },
    publisher: {
      '@type': 'Organization',
      name: site.title,
      url: site.baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: toCanonical('Images/HackUnion-Logo.png')
      }
    },
    datePublished: post.publishedDateISO,
    dateModified: post.updatedDateISO,
    mainEntityOfPage: canonical,
    url: canonical,
    articleSection: post.category,
    keywords: post.tags.join(', ')
  };

  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: post.author.name,
    description: post.author.bio,
    image: toCanonical(post.author.image),
    url: canonical
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${post.excerpt}" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${post.excerpt}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${post.publishedDateISO}" />
    <meta property="article:modified_time" content="${post.updatedDateISO}" />
    <meta property="article:author" content="${post.author.name}" />
    <meta property="article:section" content="${post.category}" />
    ${post.tags.map((tag) => `<meta property="article:tag" content="${tag}" />`).join('\n    ')}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${post.excerpt}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="stylesheet" href="../../styles/site.css" />
    <link rel="manifest" href="../../manifest.webmanifest" />
    <link rel="icon" href="../../favicon_io/HU/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="../../favicon_io/HU/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="../../favicon_io/HU/favicon-16x16.png" />
    <title>${title}</title>
    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(authorSchema)}</script>
  </head>
  <body
    class="blogs-page blogs-page--article"
    data-page="blogs-article"
    data-seo-title="${title}"
    data-seo-description="${post.excerpt}"
    data-seo-image="${ogImage}"
    data-seo-url="${canonical}"
  >
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-shell">
      ${buildHeader('../../', { blogsCurrent: true })}

      <main id="main-content" class="site-main blog-article-main">
        <article class="section blog-article" aria-labelledby="blog-title">
          <div class="container container--wide blog-article__layout">
            <aside class="blog-sidebar" aria-label="Article tools" data-animate="fade-right">
              <div class="card blog-sidebar__card blog-toc">
                <h2>Table of Contents</h2>
                ${renderToc(post.toc)}
              </div>

              <details class="card blog-sidebar__card blog-toc-mobile">
                <summary>Table of Contents</summary>
                ${renderToc(post.toc)}
              </details>

              <section class="blog-related blog-related--sidebar blog-sidebar__card" aria-labelledby="keep-reading-title">
                <div class="section-header">
                  <p class="section-header__eyebrow">Keep Reading</p>
                  <h2 id="keep-reading-title" class="section-header__title">Keep Reading</h2>
                </div>
                <div class="blog-related__grid" data-stagger>
                  ${renderRelatedCards(context.related)}
                </div>
              </section>
            </aside>

            <div class="blog-article__content">
              <header class="blog-article__header" data-animate="fade-up">
                <p class="blog-article__eyebrow">HackUnion Engineering Journal</p>
                <div class="blog-article__kicker">
                  <p class="blog-chip">${post.category}</p>
                  <p class="blog-article__reading-time">${post.readingTime}</p>
                </div>
                <h1 id="blog-title">${post.title}</h1>
                <p class="blog-article__excerpt">${post.excerpt}</p>

                <div class="blog-meta">
                  <img class="blog-meta__author-image" src="../../${post.author.image}" alt="${post.author.name}" loading="lazy" decoding="async" />
                  <div class="blog-meta__author-copy">
                    <p class="blog-meta__author-name">${post.author.name}</p>
                    <p class="blog-meta__author-detail">Published ${post.publishedDateLabel} · Updated ${post.updatedDateLabel}</p>
                  </div>
                </div>

                <div class="blog-article__tags" aria-label="Article tags">${renderTagLinks(post.tags, '../')}</div>
              </header>

              <figure class="blog-article__cover blog-image-holder card" data-animate="zoom" style="--blog-image-position: ${post.coverImagePosition};">
                <img src="../../${post.coverImage}" alt="${post.coverImageAlt}" loading="eager" decoding="async" />
              </figure>

              <div class="blog-prose" data-animate="fade-up">
                ${post.contentHtml}
              </div>

              <nav class="blog-article__mobile-next" aria-label="Next article">
                ${renderMobileNextLink(context.previous || context.next)}
              </nav>

              <nav class="blog-article__pager" aria-label="Article pagination">
                ${prevLink}
                ${nextLink}
              </nav>

              <section class="blog-author card" aria-labelledby="author-section-title">
                <img class="blog-author__photo" src="../../${post.author.image}" alt="${post.author.name}" loading="lazy" decoding="async" />
                <div>
                  <h2 id="author-section-title">About the author</h2>
                  <p class="blog-author__name">${post.author.name}</p>
                  <p class="blog-author__bio">${post.author.bio}</p>
                  ${renderAuthorSocials(post.author.socials)}
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>

      ${buildFooter('../../', `blog-article-email-${post.slug}`)}
    </div>

    <script type="module" src="../../src/scripts/main.js"></script>
  </body>
</html>`;
};

const clearGeneratedBlogRoutes = (validSlugs) => {
  ensureDir(blogsDir);

  const children = fs.readdirSync(blogsDir, { withFileTypes: true });
  for (const entry of children) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (!validSlugs.includes(entry.name)) {
      fs.rmSync(path.join(blogsDir, entry.name), { recursive: true, force: true });
    }
  }
};

const scoreRelated = (source, candidate) => {
  let score = 0;

  if (source.category === candidate.category) {
    score += 3;
  }

  const sourceTags = new Set(source.tags.map((tag) => tag.toLowerCase()));
  for (const tag of candidate.tags) {
    if (sourceTags.has(tag.toLowerCase())) {
      score += 1;
    }
  }

  return score;
};

const render = () => {
  const posts = readBlogPosts();

  if (!posts.length) {
    throw new Error('No blog posts found in content/blogs');
  }

  ensureDir(blogsDir);
  ensureDir(publicDataDir);

  const featured = posts.find((post) => post.featured) || posts[0];
  const categories = [...defaultCategories];

  for (const post of posts) {
    if (!categories.includes(post.category)) {
      categories.push(post.category);
    }
  }

  clearGeneratedBlogRoutes(posts.map((post) => post.slug));

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    featuredSlug: featured.slug,
    categories,
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      coverImage: post.coverImage,
      coverImageAlt: post.coverImageAlt,
      coverImagePosition: post.coverImagePosition,
      author: {
        name: post.author.name,
        image: post.author.image
      },
      publishedDateISO: post.publishedDateISO,
      publishedDateLabel: post.publishedDateLabel,
      updatedDateISO: post.updatedDateISO,
      updatedDateLabel: post.updatedDateLabel,
      readingTime: post.readingTime,
      featured: post.featured
    }))
  };

  fs.writeFileSync(publicDataIndexFile, `${JSON.stringify(indexPayload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(blogsDir, 'index.html'), renderIndexHtml(), 'utf8');

  posts.forEach((post, index) => {
    const previous = index < posts.length - 1 ? posts[index + 1] : null;
    const next = index > 0 ? posts[index - 1] : null;

    const related = posts
      .filter((candidate) => candidate.slug !== post.slug)
      .map((candidate) => ({ candidate, score: scoreRelated(post, candidate) }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return new Date(b.candidate.publishedDateISO).getTime() - new Date(a.candidate.publishedDateISO).getTime();
      })
      .slice(0, 3)
      .map((entry) => entry.candidate);

    const pageDir = path.join(blogsDir, post.slug);
    ensureDir(pageDir);
    fs.writeFileSync(path.join(pageDir, 'index.html'), renderArticleHtml(post, { previous, next, related }), 'utf8');
  });

  const blogRouteEntries = posts.map((post) => `  <url>\n    <loc>${toCanonical(`blogs/${post.slug}/`)}</loc>\n    <lastmod>${post.updatedDateISO.slice(0, 10)}</lastmod>\n  </url>`).join('\n');
  const staticEntries = staticSitemapRoutes.map((route) => `  <url>\n    <loc>${toCanonical(route)}</loc>\n  </url>`).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogRouteEntries}
</urlset>
`;

  fs.writeFileSync(sitemapFile, sitemapXml, 'utf8');

  console.log(`Generated ${posts.length} blog pages, index data, and sitemap entries.`);
};

render();
