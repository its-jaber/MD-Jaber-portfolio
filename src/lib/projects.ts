import { getImage } from 'astro:assets';
import type { CSSProperties } from 'react';
import type { CardProject } from '../components/react/ProjectCard';
import { getCollection, type CollectionEntry } from 'astro:content';
import { stageLabels } from '../content.config';

export type Project = CollectionEntry<'projects'>;

/**
 * Drafts are visible while running `npm run dev` (with a DRAFT badge) or when
 * SHOW_DRAFTS=true. A normal production build only ever contains published projects.
 */
export const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

// Every image a project may reference: files next to index.md, plus the private asset inbox.
// Lazy on purpose: an image is only bundled when a page that is actually built imports it,
// so screenshots of draft projects never end up in a production build.
// The private inbox is only visible to dev / SHOW_DRAFTS previews; in a public build this
// branch is a compile-time `false`, so none of its files can be copied into dist/.
type Loader = Record<string, () => Promise<{ default: ImageMetadata }>>;
const inbox: Loader =
  import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true'
    ? import.meta.glob<{ default: ImageMetadata }>('/asset-inbox/**/*.{png,jpg,jpeg,webp,avif}')
    : {};
const images: Loader = {
  ...import.meta.glob<{ default: ImageMetadata }>('/src/content/projects/**/*.{png,jpg,jpeg,webp,avif}'),
  ...inbox,
};

const keyFor = (p: Project, path: string) => {
  const parts = `/src/content/projects/${p.id}/${path}`.split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return '/' + out.join('/');
};

/** True if a frontmatter image path points at an existing file (does not bundle it). */
export const imageExists = (p: Project, path?: string) => !!path && keyFor(p, path) in images;

/** Resolves a frontmatter image path (relative to the project's index.md) to image metadata, or undefined if the file is absent. */
export async function resolveImage(p: Project, path?: string): Promise<ImageMetadata | undefined> {
  if (!path) return undefined;
  const load = images[keyFor(p, path)];
  return load ? (await load()).default : undefined;
}

/** Screenshots under this width are shown at native size, never upscaled. */
export const NARROW = 800;

/**
 * How a screenshot is presented: `wide` = normal desktop capture (fills the frame),
 * `phone` = app screen (phone bezel), `page` = narrow full-page web capture (slim browser window).
 */
export type Display = 'wide' | 'phone' | 'page';
export const displayOf = (img: { width: number; height: number }): Display =>
  img.width >= NARROW ? 'wide' : img.height / img.width <= 2.4 ? 'phone' : 'page';

export type Trim = [number, number, number, number];

/**
 * Inline styles that crop `trim` px off each edge of an image without resampling it:
 * a wrapper with the trimmed aspect ratio, and the image offset inside it.
 */
export function trimStyles(img: { width: number; height: number }, trim?: Trim): { wrap: CSSProperties; img: CSSProperties } | undefined {
  if (!trim || trim.every((n) => !n)) return undefined;
  const [t, r, b, l] = trim;
  const w = img.width - l - r;
  const h = img.height - t - b;
  return {
    wrap: { position: 'relative', overflow: 'hidden', aspectRatio: `${w} / ${h}`, width: `${w}px`, maxWidth: '100%' },
    img: { position: 'absolute', maxWidth: 'none', width: `${(img.width / w) * 100}%`, left: `${(-l / w) * 100}%`, top: `${(-t / h) * 100}%` },
  };
}

/** Responsive widths that never exceed the source image. */
export const widthsFor = (img: ImageMetadata, want: number[]) => {
  const w = want.filter((x) => x < img.width);
  return [...w, Math.min(img.width, Math.max(...want))];
};

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');

  for (const p of all) {
    if (p.data.status !== 'published') continue;
    if (/TODO/.test(p.body ?? '')) {
      throw new Error(`Cannot publish "${p.data.title}": the case study body still contains TODO markers.`);
    }
    const missing = [p.data.cover, ...p.data.gallery.map((g) => g.src)].filter((x) => x && !imageExists(p, x));
    if (missing.length) {
      throw new Error(`Cannot publish "${p.data.title}": image file(s) not found: ${missing.join(', ')}. Published images must be committed next to index.md.`);
    }
    if ([p.data.cover, ...p.data.gallery.map((g) => g.src)].some((x) => x?.includes('asset-inbox'))) {
      throw new Error(`Cannot publish "${p.data.title}": it still points at the private asset-inbox. Copy the approved, optimised image next to index.md first.`);
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
  const src = await resolveImage(p, d.cover);
  if (src) {
    const img = await getImage({ src, widths: widthsFor(src, [480, 800, 1200]), format: 'webp' });
    cover = {
      src: img.src,
      srcset: img.srcSet.attribute,
      width: src.width,
      height: src.height,
      alt: d.coverAlt ?? '',
      narrow: src.width < NARROW,
      display: displayOf(src),
      trim: trimStyles(src, d.coverTrim as Trim | undefined),
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
