import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';

const blogRoot = resolve(__dirname, 'blogs');

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

export default defineConfig({
  base: './',
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
        certificate: resolve(__dirname, 'certificate/index.html'),
        certificates: resolve(__dirname, 'certificates/index.html'),
        blogs: resolve(__dirname, 'blogs/index.html'),
        ...getBlogInputs()
      }
    }
  }
});