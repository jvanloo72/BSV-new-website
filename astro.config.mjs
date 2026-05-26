// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://bsvlaw.com',
  trailingSlash: 'never',

  integrations: [mdx(), sitemap()],

  adapter: vercel({
    webAnalytics: { enabled: false },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
