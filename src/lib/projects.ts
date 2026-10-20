import { getImage } from 'astro:assets';
import type { CardProject } from '../components/react/ProjectCard';
import { getCollection, type CollectionEntry } from 'astro:content';
import { stageLabels } from '../content.config';

export type Project = CollectionEntry<'projects'>;

/**
 * Drafts are visible while running `npm run dev` (with a DRAFT badge) or when
 * SHOW_DRAFTS=true. A normal production build only ever contains published projects.
 */
export const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');

  for (const p of all) {
    if (p.data.status === 'published' && /TODO/.test(p.body ?? '')) {
      throw new Error(`Cannot publish "${p.data.title}": the case study body still contains TODO markers.`);
    }
  }

  return all
    .filter((p) => showDrafts || p.data.status === 'published')
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export const isDraft = (p: Project) => p.data.status !== 'published';

/** Placeholder copy (anything containing TODO) is never rendered; returns undefined instead. */
export const clean = (text?: string) => (text && !/TODO/i.test(text) ? text : undefined);

/**
 * Draft bodies only: turns paragraphs that start with "TODO" into tidy
 * <p class="slot"> placeholders so previews never show raw TODO markers.
 * Published projects can't contain TODO (the build fails), so they always use <Content />.
 */
export function draftHtmlWithSlots(p: Project): string | undefined {
  const html = p.rendered?.html;
  if (!html || !/TODO/.test(p.body ?? '')) return undefined;
  return html.replace(/<p>\s*TODO\s*:?\s*([\s\S]*?)<\/p>/g, '<p class="slot">$1</p>');
}

/** Text for the frame's address pill: the live site's hostname, else the project slug. */
export function frameLabel(p: Project) {
  const url = p.data.links.live ?? p.data.links.demo;
  if (url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {}
  }
  return p.id;
}

/** Converts a collection entry into the plain props the React card needs (with an optimised cover). */
export async function toCard(p: Project): Promise<CardProject> {
  const d = p.data;
  let cover: CardProject['cover'];
  if (d.cover) {
    const img = await getImage({ src: d.cover, widths: [480, 800, 1200], format: 'webp' });
    cover = {
      src: img.src,
      srcset: img.srcSet.attribute,
      width: d.cover.width,
      height: d.cover.height,
      alt: d.coverAlt ?? '',
    };
  }
  return {
    slug: p.id,
    title: d.title,
    tagline: clean(d.tagline),
    category: d.category,
    kind: clean(d.kind) ?? d.category,
    year: d.year || undefined,
    tags: d.tags,
    stack: d.stack,
    accent: d.accent,
    draft: isDraft(p),
    frameLabel: frameLabel(p),
    stage: d.stage ? stageLabels[d.stage].label : undefined,
    cover,
  };
}
