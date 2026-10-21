// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  // Production domain (used for canonical, Open Graph and sitemap URLs).
  site: 'https://jaber.floowtix.com',
  integrations: [react()],
  build: { format: 'directory' },
  // Keeps the local preview clean (the toolbar overlays the bottom of the page).
  devToolbar: { enabled: false },
});
