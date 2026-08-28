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

const scorePost = (post, query) => {
  if (!query) {
    return 0;
  }

  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;
  const inTitle = post.title.toLowerCase();
  const inExcerpt = post.excerpt.toLowerCase();
  const inCategory = post.category.toLowerCase();
  const tags = post.tags.map((tag) => tag.toLowerCase());

  if (inTitle.includes(normalizedQuery)) score += 60;
  if (inExcerpt.includes(normalizedQuery)) score += 25;
  if (inCategory.includes(normalizedQuery)) score += 30;

  for (const tag of tags) {
    if (tag.includes(normalizedQuery)) {
      score += 15;
    }
  }

  return score;
};

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
    <a class="button button--primary blog-featured-card__cta" href="./${post.slug}/">Read Article <span data-lucide="arrow-right"></span></a>
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
    <div class="blog-grid-card__tags">${post.tags.map((tag) => `<a class="blog-tag" href="?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`).join('')}</div>
    <div class="blog-meta blog-meta--compact">
      <span>${escapeHtml(post.author.name)}</span>
      <span>${escapeHtml(post.publishedDateLabel)}</span>
      <span>${escapeHtml(post.readingTime)}</span>
    </div>
    <a class="blog-grid-card__read-more" href="./${post.slug}/">Read More</a>
  </div>
</article>`;

const initBlogsIndex = async () => {
  const rootPath = document.body.dataset.blogRootPath || '../';
  const dataPath = document.body.dataset.blogIndexPath;
  const featuredSlot = document.querySelector('[data-blog-featured]');
  const grid = document.querySelector('[data-blog-grid]');
  const emptyState = document.querySelector('[data-blog-empty]');
  const searchInput = document.querySelector('[data-blog-search]');
  const sortSelect = document.querySelector('[data-blog-sort]');
  const categoriesWrap = document.querySelector('[data-blog-categories]');
  const themeControls = document.querySelector('[data-blog-theme-controls]');
  const resultText = document.querySelector('[data-blog-result-text]');

  if (!dataPath || !featuredSlot || !grid || !searchInput || !sortSelect || !categoriesWrap || !resultText) {
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
  let activeCategory = (url.searchParams.get('category') || '').trim();
  let activeTag = (url.searchParams.get('tag') || '').trim();
  let activeSort = (url.searchParams.get('sort') || 'latest').trim().toLowerCase();
  let activeTheme = (url.searchParams.get('theme') || 'tech').trim().toLowerCase();

  if (!['latest', 'oldest', 'relevant'].includes(activeSort)) {
    activeSort = 'latest';
  }

  if (!['tech', 'editorial'].includes(activeTheme)) {
    activeTheme = 'tech';
  }

  searchInput.value = activeQuery;
  sortSelect.value = activeSort;

  const categories = payload.categories || [];

  const applyTheme = () => {
    document.body.dataset.blogVisualTheme = activeTheme;

    if (!themeControls) {
      return;
    }

    const buttons = themeControls.querySelectorAll('[data-blog-theme]');
    buttons.forEach((button) => {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      const isActive = (button.dataset.blogTheme || '') === activeTheme;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderCategoryButtons = () => {
    const categoryButtons = [`<button class="blogs-controls__chip${activeCategory ? '' : ' is-active'}" type="button" data-blog-category="">All</button>`]
      .concat(categories.map((category) => {
        const isActive = activeCategory.toLowerCase() === category.toLowerCase();
        return `<button class="blogs-controls__chip${isActive ? ' is-active' : ''}" type="button" data-blog-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
      }));

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

    if (activeSort !== 'latest') nextUrl.searchParams.set('sort', activeSort);
    else nextUrl.searchParams.delete('sort');

    if (activeTheme !== 'tech') nextUrl.searchParams.set('theme', activeTheme);
    else nextUrl.searchParams.delete('theme');

    window.history.replaceState({}, '', nextUrl);
  };

  const sortPosts = (posts) => {
    if (activeSort === 'oldest') {
      return [...posts].sort((a, b) => toTimestamp(a.publishedDateISO) - toTimestamp(b.publishedDateISO));
    }

    if (activeSort === 'relevant') {
      const queryForScore = activeQuery || activeTag || activeCategory;
      return [...posts].sort((a, b) => {
        const scoreDiff = scorePost(b, queryForScore) - scorePost(a, queryForScore);
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return toTimestamp(b.publishedDateISO) - toTimestamp(a.publishedDateISO);
      });
    }

    return [...posts].sort((a, b) => toTimestamp(b.publishedDateISO) - toTimestamp(a.publishedDateISO));
  };

  const applyFilters = () => {
    let posts = payload.posts || [];

    posts = posts.filter((post) => matchesQuery(post, activeQuery));

    if (activeCategory) {
      posts = posts.filter((post) => post.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (activeTag) {
      posts = posts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()));
    }

    return sortPosts(posts);
  };

  const render = () => {
    renderCategoryButtons();
    applyTheme();
    updateSearchParams();

    const featuredPost = payload.posts.find((post) => post.slug === payload.featuredSlug) || payload.posts[0];
    featuredSlot.innerHTML = renderFeatured(featuredPost, rootPath);

    const filteredPosts = applyFilters();

    resultText.textContent = `${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'} found`;

    if (!filteredPosts.length) {
      grid.innerHTML = '';
      if (emptyState) {
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

  sortSelect.addEventListener('change', (event) => {
    activeSort = event.target.value;
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

    activeCategory = button.dataset.blogCategory || '';
    render();
  });

  themeControls?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('[data-blog-theme]');
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const nextTheme = (button.dataset.blogTheme || '').toLowerCase();
    if (!['tech', 'editorial'].includes(nextTheme)) {
      return;
    }

    activeTheme = nextTheme;
    render();
  });

  grid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const tagLink = target.closest('.blog-tag');
    if (!(tagLink instanceof HTMLAnchorElement)) {
      return;
    }

    event.preventDefault();
    const url = new URL(tagLink.href);
    activeTag = url.searchParams.get('tag') || '';
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
