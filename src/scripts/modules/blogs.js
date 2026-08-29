import { createIcons, icons } from '../../../node_modules/lucide/dist/esm/lucide.js';

const buildAssetUrl = (rootPath, assetPath) => {
  if (!assetPath) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith('data:')) {
    return assetPath;
  }

  const cleaned = assetPath.replace(/^\.\//, '').replace(/^\//, '');
  return `${rootPath}${cleaned}`;
};

const toTimestamp = (iso) => new Date(iso).getTime();

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderIcons = () => {
  createIcons({ icons });
};

const FEATURED_POST_SLUG = 'interledger-technology-rethinking-the-future-of-global-payments';

const categoryFilters = [
  {
    label: 'All',
    key: '',
    match: () => true
  },
  {
    label: 'Builder Stories',
    key: 'builder-stories',
    match: (post) => post.category.toLowerCase() === 'builder stories'
      || post.category.toLowerCase() === 'stories'
      || post.tags.some((tag) => tag.toLowerCase().includes('stories'))
  },
  {
    label: 'Build & Ship',
    key: 'build-ship',
    match: (post) => post.category.toLowerCase() === 'build & ship'
      || post.category.toLowerCase() === 'building'
      || post.tags.some((tag) => ['building', 'product', 'shipping'].includes(tag.toLowerCase()))
  },
  {
    label: 'AI & Technology',
    key: 'ai-technology',
    match: (post) => post.category.toLowerCase() === 'ai & technology'
      || post.category.toLowerCase() === 'technology'
      || post.tags.some((tag) => ['technology', 'ai', 'interledger', 'fintech', 'open payments'].includes(tag.toLowerCase()))
  },
  {
    label: 'Open Source',
    key: 'open-source',
    match: (post) => post.category.toLowerCase() === 'open source'
      || post.tags.some((tag) => tag.toLowerCase() === 'open source')
  },
  {
    label: 'Community',
    key: 'community',
    match: (post) => post.category.toLowerCase() === 'community'
      || post.tags.some((tag) => tag.toLowerCase() === 'community')
  },
  {
    label: 'Events & Experiences',
    key: 'events-experiences',
    match: (post) => post.category.toLowerCase() === 'events & experiences'
      || post.category.toLowerCase() === 'events'
      || post.tags.some((tag) => ['events', 'experiences'].includes(tag.toLowerCase()))
  },
  {
    label: 'Career & Growth',
    key: 'career-growth',
    match: (post) => post.category.toLowerCase() === 'career & growth'
      || post.category.toLowerCase() === 'career'
      || post.tags.some((tag) => ['career', 'growth', 'lessons'].includes(tag.toLowerCase()))
  }
];

const matchesQuery = (post, query) => {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return true;
  }

  return [
    post.title,
    post.author.name,
    post.excerpt,
    post.category,
    post.tags.join(' ')
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
};

const renderFeatured = (post, rootPath) => {
  if (!post) {
    return '';
  }

  return `
<article class="card blog-featured-card">
  <a class="blog-featured-card__media blog-image-holder" style="--blog-image-ratio: 16 / 10; --blog-image-position: ${escapeHtml(post.coverImagePosition || 'center')};" href="./${post.slug}/" aria-label="Read featured article: ${escapeHtml(post.title)}">
    <img src="${buildAssetUrl(rootPath, post.coverImage)}" alt="${escapeHtml(post.coverImageAlt)}" loading="eager" decoding="async" />
  </a>
  <div class="blog-featured-card__body">
    <p class="blog-featured-card__kicker">Featured</p>
    <p class="blog-chip">${escapeHtml(post.category)}</p>
    <h3><a href="./${post.slug}/">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.excerpt)}</p>
    <div class="blog-meta">
      <img class="blog-meta__author-image" src="${buildAssetUrl(rootPath, post.author.image)}" alt="${escapeHtml(post.author.name)}" loading="lazy" decoding="async" />
      <div class="blog-meta__author-copy">
        <p class="blog-meta__author-name">${escapeHtml(post.author.name)}</p>
        <p class="blog-meta__author-detail">${escapeHtml(post.publishedDateLabel)} · ${escapeHtml(post.readingTime)}</p>
      </div>
    </div>
    <a class="button button--primary blog-featured-card__cta" href="./${post.slug}/">Read article <span data-lucide="arrow-right"></span></a>
  </div>
</article>`;
};

const renderGridCard = (post, rootPath) => `
<article class="card blog-grid-card" data-hover="card">
  <a class="blog-grid-card__media blog-image-holder" style="--blog-image-ratio: 16 / 10; --blog-image-position: ${escapeHtml(post.coverImagePosition || 'center')};" href="./${post.slug}/" aria-label="Read article: ${escapeHtml(post.title)}">
    <img src="${buildAssetUrl(rootPath, post.coverImage)}" alt="${escapeHtml(post.coverImageAlt)}" loading="lazy" decoding="async" />
  </a>
  <div class="blog-grid-card__body">
    <p class="blog-chip">${escapeHtml(post.category)}</p>
    <h3><a href="./${post.slug}/">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.excerpt)}</p>
    <div class="blog-meta blog-meta--compact">
      <span>${escapeHtml(post.author.name)}</span>
      <span>${escapeHtml(post.publishedDateLabel)}</span>
      <span>${escapeHtml(post.readingTime)}</span>
    </div>
    <a class="blog-grid-card__read-more" href="./${post.slug}/">Read article</a>
  </div>
</article>`;

const initBlogsIndex = async () => {
  const rootPath = document.body.dataset.blogRootPath || '../';
  const dataPath = document.body.dataset.blogIndexPath;
  const featuredSlot = document.querySelector('[data-blog-featured]');
  const grid = document.querySelector('[data-blog-grid]');
  const emptyState = document.querySelector('[data-blog-empty]');
  const searchInput = document.querySelector('[data-blog-search]');
  const categoriesWrap = document.querySelector('[data-blog-categories]');
  const resultText = document.querySelector('[data-blog-result-text]');
  const heroLatestLink = document.querySelector('[data-blog-hero-latest]');
  const heroLatestCategory = document.querySelector('[data-blog-hero-category]');
  const heroLatestTitle = document.querySelector('[data-blog-hero-title]');
  const heroLatestExcerpt = document.querySelector('[data-blog-hero-excerpt]');

  if (!dataPath || !featuredSlot || !grid || !searchInput || !categoriesWrap || !resultText) {
    return;
  }

  let payload;

  try {
    const response = await fetch(dataPath, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Unable to load blog index: ${response.status}`);
    }

    payload = await response.json();
  } catch (error) {
    grid.innerHTML = '<article class="card blogs-empty"><h3>Blog content could not be loaded.</h3><p>Please try reloading this page.</p></article>';
    return;
  }

  const url = new URL(window.location.href);
  let activeQuery = (url.searchParams.get('q') || '').trim();
  let activeCategory = (url.searchParams.get('category') || '').trim().toLowerCase();
  let activeTag = (url.searchParams.get('tag') || '').trim();

  searchInput.value = activeQuery;

  if (!categoryFilters.some((filter) => filter.key === activeCategory)) {
    activeCategory = '';
  }

  const renderCategoryButtons = () => {
    const categoryButtons = categoryFilters.map((filter) => {
      const isActive = activeCategory === filter.key;
      return `<button class="blogs-controls__chip${isActive ? ' is-active' : ''}" type="button" data-blog-category="${escapeHtml(filter.key)}">${escapeHtml(filter.label)}</button>`;
    });

    categoriesWrap.innerHTML = categoryButtons.join('');
  };

  const updateSearchParams = () => {
    const nextUrl = new URL(window.location.href);

    if (activeQuery) nextUrl.searchParams.set('q', activeQuery);
    else nextUrl.searchParams.delete('q');

    if (activeCategory) nextUrl.searchParams.set('category', activeCategory);
    else nextUrl.searchParams.delete('category');

    if (activeTag) nextUrl.searchParams.set('tag', activeTag);
    else nextUrl.searchParams.delete('tag');

    nextUrl.searchParams.delete('sort');
    nextUrl.searchParams.delete('theme');

    window.history.replaceState({}, '', nextUrl);
  };

  const applyFilters = () => {
    let posts = payload.posts || [];

    posts = [...posts].sort((a, b) => toTimestamp(b.publishedDateISO) - toTimestamp(a.publishedDateISO));

    posts = posts.filter((post) => matchesQuery(post, activeQuery));

    if (activeCategory) {
      const selectedFilter = categoryFilters.find((filter) => filter.key === activeCategory);
      posts = selectedFilter ? posts.filter((post) => selectedFilter.match(post)) : posts;
    }

    if (activeTag) {
      posts = posts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()));
    }

    const hasActiveFilters = Boolean(activeQuery || activeCategory || activeTag);
    if (!hasActiveFilters) {
      posts = posts.filter((post) => post.slug !== FEATURED_POST_SLUG);
    }

    return posts;
  };

  const render = () => {
    renderCategoryButtons();
    updateSearchParams();

    const featuredPost = payload.posts.find((post) => post.slug === FEATURED_POST_SLUG)
      || payload.posts.find((post) => post.slug === payload.featuredSlug)
      || payload.posts[0];

    if (featuredPost && heroLatestLink && heroLatestCategory && heroLatestTitle && heroLatestExcerpt) {
      heroLatestLink.setAttribute('href', `./${featuredPost.slug}/`);
      heroLatestLink.setAttribute('aria-label', `Read latest article: ${featuredPost.title}`);
      heroLatestCategory.textContent = featuredPost.category;
      heroLatestTitle.textContent = featuredPost.title;
      heroLatestExcerpt.textContent = featuredPost.excerpt;
    }

    featuredSlot.innerHTML = renderFeatured(featuredPost, rootPath);

    const filteredPosts = applyFilters();

    resultText.textContent = `${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'} found`;

    if (!filteredPosts.length) {
      grid.innerHTML = '';
      if (emptyState) {
        const hasActiveFilters = Boolean(activeQuery || activeTag || activeCategory);

        if (!hasActiveFilters && (payload.posts || []).length) {
          resultText.textContent = 'Showing featured article';
          emptyState.setAttribute('hidden', 'hidden');
          emptyState.classList.add('hidden');
          return;
        }

        const hasSearch = Boolean(activeQuery || activeTag);
        const isCategoryOnly = Boolean(activeCategory && !hasSearch);
        const heading = isCategoryOnly ? 'No articles in this category yet.' : 'No articles found.';
        const detail = isCategoryOnly ? 'Check back soon for new stories in this category.' : 'Try a different search or category.';
        const headingNode = emptyState.querySelector('h3');
        const detailNode = emptyState.querySelector('p');

        if (headingNode) {
          headingNode.textContent = heading;
        }

        if (detailNode) {
          detailNode.textContent = detail;
        }

        emptyState.removeAttribute('hidden');
        emptyState.classList.remove('hidden');
      }
      return;
    }

    if (emptyState) {
      emptyState.setAttribute('hidden', 'hidden');
      emptyState.classList.add('hidden');
    }
    grid.innerHTML = filteredPosts.map((post) => renderGridCard(post, rootPath)).join('');

    renderIcons();
  };

  searchInput.addEventListener('input', (event) => {
    activeQuery = event.target.value.trim();
    render();
  });

  categoriesWrap.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('[data-blog-category]');
    if (!(button instanceof HTMLElement)) {
      return;
    }

    activeCategory = (button.dataset.blogCategory || '').toLowerCase();
    render();
  });

  render();
};

const initBlogArticle = () => {
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href;
  const shareLinks = document.querySelectorAll('[data-share]');

  if (!shareLinks.length) {
    return;
  }

  shareLinks.forEach((element) => {
    const mode = element.getAttribute('data-share');

    if (mode === 'copy') {
      element.addEventListener('click', async () => {
        const label = element.textContent;

        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(canonicalUrl);
          } else {
            const input = document.createElement('input');
            input.value = canonicalUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
          }

          element.textContent = 'Copied';
          window.setTimeout(() => {
            element.textContent = label;
          }, 1600);
        } catch {
          element.textContent = 'Copy Failed';
          window.setTimeout(() => {
            element.textContent = label;
          }, 1600);
        }
      });

      return;
    }

    if (!(element instanceof HTMLAnchorElement)) {
      return;
    }

    if (mode === 'whatsapp') {
      element.href = `https://wa.me/?text=${encodeURIComponent(canonicalUrl)}`;
      return;
    }

    if (mode === 'linkedin') {
      element.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;
      return;
    }

    if (mode === 'x') {
      const title = document.querySelector('h1')?.textContent?.trim() || 'HackUnion Blog';
      element.href = `https://x.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(title)}`;
    }
  });

  renderIcons();
};

export const initBlogs = () => {
  const page = document.body.dataset.page;

  if (page === 'blogs-index') {
    initBlogsIndex();
    return;
  }

  if (page === 'blogs-article') {
    initBlogArticle();
  }
};
