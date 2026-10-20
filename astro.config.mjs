// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  // Set this to the real domain before deploying (used for canonical + OG URLs).
  site: 'https://example.com',
  integrations: [react()],
  build: { format: 'directory' },
  // Keeps the local preview clean (the toolbar overlays the bottom of the page).
  devToolbar: { enabled: false },
});
