import { defineConfig } from 'astro/config';
const site = process.env.PUBLIC_SITE_URL || undefined;
export default defineConfig({ site, output: 'static', trailingSlash: 'always', devToolbar: { enabled: false } });
