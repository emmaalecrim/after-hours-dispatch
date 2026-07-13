import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// This is a single-page app: one Astro page mounts a fully client-side
// React tree. There is no routing — the "post dialog" is an overlay,
// never a navigation.
export default defineConfig({
  integrations: [react()],
  output: 'static',
  adapter: cloudflare()
});