import { getImage } from 'astro:assets';
import type { CardProject } from '../components/react/ProjectCard';
import { getCollection, type CollectionEntry } from 'astro:content';

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

export function initials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}


/** Converts a collection entry into the plain props the React card needs (with an optimised cover). */
export async function toCard(p: Project): Promise<CardProject> {
  const d = p.data;
  let cover: CardProject['cover'];
  if (d.cover) {
    const img = await getImage({ src: d.cover, widths: [640, 960, 1400], format: 'webp' });
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
    tagline: d.tagline,
    category: d.category,
    kind: d.kind,
    year: d.year || undefined,
    tags: d.tags,
    stack: d.stack,
    accent: d.accent,
    draft: isDraft(p),
    initials: initials(d.title),
    cover,
  };
}
