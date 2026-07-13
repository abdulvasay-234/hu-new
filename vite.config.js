import { defineConfig } from 'vite';
import { resolve } from 'path';

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
        obw: resolve(__dirname, 'obw/index.html'),
        coc: resolve(__dirname, 'coc/index.html'),
        organizers: resolve(__dirname, 'organizers/index.html')
      }
    }
  }
});