// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://bsvlaw.com',
  trailingSlash: 'never',

  // DESIGN-03 / D-06 / D-07: self-host Hanken Grotesk via Astro's built-in
  // Fonts API. A single OFL-licensed VARIABLE woff2 (~34 KB, well under the
  // 200 KB budget) covers the full 400-800 weight range. Served from 'self'
  // (CSP font-src 'self'); NO Google Fonts CDN link. Astro auto-generates the
  // size-adjust fallback metrics + font-display: swap to keep CLS <= 0.1.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-hanken',
      fallbacks: ['sans-serif'],
      display: 'swap',
      optimizedFallbacks: true,
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/HankenGrotesk-Variable.woff2'],
            weight: '400 800',
            style: 'normal',
          },
        ],
      },
    },
  ],

  // D-16: exclude the internal /_design gallery route from the sitemap.
  integrations: [
    mdx(),
    sitemap({ filter: (page) => page !== 'https://bsvlaw.com/_design' }),
    icon(),
  ],

  adapter: vercel({
    webAnalytics: { enabled: false },
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
