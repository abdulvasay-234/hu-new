import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';

const blogRoot = resolve(__dirname, 'blogs');
const projectsRoot = resolve(__dirname, 'projects');
const gallerySourceDir = resolve(__dirname, 'Images', 'gallery');

const getBlogInputs = () => {
  if (!fs.existsSync(blogRoot)) {
    return {};
  }

  const entries = {};
  const children = fs.readdirSync(blogRoot, { withFileTypes: true });

  for (const child of children) {
    if (!child.isDirectory()) {
      continue;
    }

    const slug = child.name;
    const blogEntry = resolve(blogRoot, slug, 'index.html');

    if (!fs.existsSync(blogEntry)) {
      continue;
    }

    entries[`blog-${slug}`] = blogEntry;
  }

  return entries;
};

const getProjectInputs = () => {
  if (!fs.existsSync(projectsRoot)) {
    return {};
  }

  const entries = {};
  const rootEntry = resolve(projectsRoot, 'index.html');

  if (fs.existsSync(rootEntry)) {
    entries.projects = rootEntry;
  }

  const children = fs.readdirSync(projectsRoot, { withFileTypes: true });

  for (const child of children) {
    if (!child.isDirectory()) {
      continue;
    }

    const slug = child.name;
    const projectEntry = resolve(projectsRoot, slug, 'index.html');

    if (!fs.existsSync(projectEntry)) {
      continue;
    }

    entries[`project-${slug}`] = projectEntry;
  }

  return entries;
};

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'copy-gallery-runtime-assets',
      closeBundle() {
        const outGalleryDir = resolve(__dirname, 'dist', 'Images', 'gallery');

        if (!fs.existsSync(gallerySourceDir)) {
          return;
        }

        fs.mkdirSync(outGalleryDir, { recursive: true });
        fs.cpSync(gallerySourceDir, outGalleryDir, { recursive: true });
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        openbuildweek: resolve(__dirname, 'openbuildweek/index.html'),
        copilotDevDays: resolve(__dirname, 'copilot-dev-days/index.html'),
        copilotDevDays1: resolve(__dirname, 'copilot-dev-days/1.0/index.html'),
        copilotDevDays2: resolve(__dirname, 'copilot-dev-days/2.0/index.html'),
        obw: resolve(__dirname, 'obw/index.html'),
        coc: resolve(__dirname, 'coc/index.html'),
        organizers: resolve(__dirname, 'organizers/index.html'),
        socials: resolve(__dirname, 'socials/index.html'),
        brandKit: resolve(__dirname, 'brand-kit/index.html'),
        certificate: resolve(__dirname, 'certificate/index.html'),
        certificates: resolve(__dirname, 'certificates/index.html'),
        discord: resolve(__dirname, 'discord/index.html'),
        github: resolve(__dirname, 'github/index.html'),
        linkedin: resolve(__dirname, 'linkedin/index.html'),
        instagram: resolve(__dirname, 'instagram/index.html'),
        youtube: resolve(__dirname, 'youtube/index.html'),
        blogs: resolve(__dirname, 'blogs/index.html'),
        ...getBlogInputs(),
        ...getProjectInputs()
      }
    }
  }
});