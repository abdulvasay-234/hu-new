import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const projectRoot = process.cwd();
const contentDir = path.join(projectRoot, 'content', 'blogs');
const authorsFile = path.join(contentDir, 'authors.json');

export const blogPaths = {
  projectRoot,
  contentDir,
  authorsFile
};

export const slugify = (value) => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

export const cleanAssetPath = (value = '') => String(value)
  .trim()
  .replace(/^\.\//, '')
  .replace(/^\//, '');

const normalizeObjectPosition = (value, fieldName, fileName) => {
  const fallback = 'center';
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }

  const normalized = String(value).trim();
  // Allow standard CSS object-position tokens while blocking invalid punctuation.
  if (!/^[a-zA-Z0-9.%\s-]+$/.test(normalized)) {
    throw new Error(`Invalid ${fieldName} in ${fileName}: ${value}`);
  }

  return normalized;
};

const normalizeObjectFit = (value, fieldName, fileName) => {
  const fallback = 'cover';
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  const allowed = new Set(['cover', 'contain', 'fill', 'none', 'scale-down']);
  if (!allowed.has(normalized)) {
    throw new Error(`Invalid ${fieldName} in ${fileName}: ${value}`);
  }

  return normalized;
};

const normalizeDateISO = (value, fieldName, fileName) => {
  if (!value) {
    throw new Error(`Missing ${fieldName} in ${fileName}`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName} in ${fileName}: ${value}`);
  }

  return date.toISOString();
};

const formatDate = (isoString) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}).format(new Date(isoString));

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const resolveSocialLinks = (socials = {}) => {
  const mapped = [];

  if (socials.github) mapped.push({ label: 'GitHub', href: socials.github, icon: 'github' });
  if (socials.linkedin) mapped.push({ label: 'LinkedIn', href: socials.linkedin, icon: 'linkedin' });
  if (socials.x) mapped.push({ label: 'X', href: socials.x, icon: 'twitter' });
  if (socials.website) mapped.push({ label: 'Website', href: socials.website, icon: 'globe' });

  return mapped;
};

const loadAuthors = () => {
  if (!fs.existsSync(authorsFile)) {
    return {};
  }

  const raw = fs.readFileSync(authorsFile, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || !parsed.authors || typeof parsed.authors !== 'object') {
    throw new Error('content/blogs/authors.json must have an object field named "authors".');
  }

  return parsed.authors;
};

const getSourceFiles = () => {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  return fs.readdirSync(contentDir)
    .filter((fileName) => (fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      && fileName.toLowerCase() !== 'readme.md'
      && !fileName.startsWith('_'))
    .sort();
};

const assertFileExists = (assetPath, fieldName, fileName, strictAssets) => {
  if (!assetPath) {
    throw new Error(`Missing ${fieldName} in ${fileName}`);
  }

  if (!strictAssets) {
    return;
  }

  const absolute = path.join(projectRoot, assetPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing asset for ${fieldName} in ${fileName}: ${assetPath}`);
  }
};

const resolveAuthor = ({ data, fileName, authorsById, strictAssets }) => {
  const authorId = String(data.authorId || '').trim();

  if (authorId) {
    const fromRegistry = authorsById[authorId];
    if (!fromRegistry) {
      throw new Error(`Unknown authorId in ${fileName}: ${authorId}`);
    }

    const name = String(fromRegistry.name || '').trim();
    const image = cleanAssetPath(fromRegistry.image || '');
    const bio = String(fromRegistry.bio || '').trim();

    if (!name || !image || !bio) {
      throw new Error(`Author registry entry is incomplete for ${authorId}`);
    }

    assertFileExists(image, `author image (${authorId})`, fileName, strictAssets);

    return {
      id: authorId,
      name,
      image,
      bio,
      socials: resolveSocialLinks(fromRegistry.socials || {})
    };
  }

  const name = String(data.author || '').trim();
  const image = cleanAssetPath(data.authorImage || '');
  const bio = String(data.authorBio || 'HackUnion contributor and builder.').trim();

  if (!name || !image) {
    throw new Error(`Provide authorId or inline author + authorImage in ${fileName}`);
  }

  assertFileExists(image, 'authorImage', fileName, strictAssets);

  return {
    id: null,
    name,
    image,
    bio,
    socials: resolveSocialLinks(data.authorSocials || {})
  };
};

export const getValidatedBlogSources = ({ strictAssets = true } = {}) => {
  const files = getSourceFiles();
  const authorsById = loadAuthors();

  if (!files.length) {
    throw new Error('No blog posts found in content/blogs');
  }

  const seenSlugs = new Set();
  const posts = [];

  for (const fileName of files) {
    const absolutePath = path.join(contentDir, fileName);
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const { data, content } = matter(raw);

    const slug = slugify(data.slug || fileName.replace(/\.(md|mdx)$/i, ''));
    if (!slug) {
      throw new Error(`Unable to create slug for ${fileName}`);
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug detected: ${slug}`);
    }
    seenSlugs.add(slug);

    const title = String(data.title || '').trim();
    const excerpt = String(data.excerpt || '').trim();
    const category = String(data.category || '').trim();
    const coverImage = cleanAssetPath(data.coverImage || '');
    const coverImageAlt = String(data.coverImageAlt || title).trim();
    const coverImagePosition = normalizeObjectPosition(data.coverImagePosition, 'coverImagePosition', fileName);
    const coverImageFit = normalizeObjectFit(data.coverImageFit, 'coverImageFit', fileName);
    const tags = toArray(data.tags);

    if (!title || !excerpt || !category) {
      throw new Error(`Missing one of required fields (title, excerpt, category) in ${fileName}`);
    }

    if (!content || !content.trim()) {
      throw new Error(`Content body is empty in ${fileName}`);
    }

    if (!/^#\s+.+/m.test(content)) {
      throw new Error(`Content must include at least one H1 heading in ${fileName}`);
    }

    if (!/^##\s+.+/m.test(content)) {
      throw new Error(`Content must include at least one H2 heading in ${fileName}`);
    }

    if (!tags.length) {
      throw new Error(`At least one tag is required in ${fileName}`);
    }

    assertFileExists(coverImage, 'coverImage', fileName, strictAssets);

    const publishedDateISO = normalizeDateISO(data.publishedDate, 'publishedDate', fileName);
    const updatedDateISO = normalizeDateISO(data.updatedDate || data.publishedDate, 'updatedDate', fileName);

    if (new Date(updatedDateISO).getTime() < new Date(publishedDateISO).getTime()) {
      throw new Error(`updatedDate cannot be earlier than publishedDate in ${fileName}`);
    }

    const author = resolveAuthor({ data, fileName, authorsById, strictAssets });

    posts.push({
      fileName,
      slug,
      title,
      excerpt,
      category,
      tags,
      featured: Boolean(data.featured),
      readingTime: data.readingTime ? String(data.readingTime).trim() : '',
      markdownContent: content,
      coverImage,
      coverImageAlt,
      coverImagePosition,
      coverImageFit,
      author,
      publishedDateISO,
      updatedDateISO,
      publishedDateLabel: formatDate(publishedDateISO),
      updatedDateLabel: formatDate(updatedDateISO)
    });
  }

  return posts.sort((a, b) => new Date(b.publishedDateISO).getTime() - new Date(a.publishedDateISO).getTime());
};
