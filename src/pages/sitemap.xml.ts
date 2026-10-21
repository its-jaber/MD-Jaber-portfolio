import type { APIRoute } from 'astro';
import { getProjects, isDraft } from '../lib/projects';

/** Published pages only: drafts are never listed, even in a SHOW_DRAFTS preview. */
export const GET: APIRoute = async ({ site }) => {
  const projects = (await getProjects()).filter((p) => !isDraft(p));
  const paths = ['/', '/work/', ...projects.map((p) => `/work/${p.id}/`)];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
