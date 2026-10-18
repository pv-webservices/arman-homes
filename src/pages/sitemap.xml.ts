import type { APIRoute } from 'astro';
import { properties } from '../data/properties.mjs';
import { projects } from '../data/projects';
export const GET: APIRoute = () => {
  const origin = import.meta.env.PUBLIC_SITE_URL;
  const routes = ['/', '/projects/', ...projects.map(p => `/projects/${p.slug}/`), '/properties/', '/buy-property/', '/sell-property/', '/rent-property/', '/residential-properties/', '/commercial-properties/', '/about-us/', '/services/', '/contact/', '/privacy-policy/', ...properties.map(p => `/properties/${p.slug}/`)];
  const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin ? routes.map(path => `<url><loc>${escape(new URL(path, origin).href)}</loc></url>`).join('') : ''}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
