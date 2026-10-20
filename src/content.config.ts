import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const categories = ['Product', 'Website', 'Automation'] as const;

/** How finished a project is. Always shown as a label so concept work is never mistaken for client work. */
export const stages = ['concept', 'prototype', 'live'] as const;
export const stageLabels: Record<(typeof stages)[number], { label: string; note: string }> = {
  concept: { label: 'Concept', note: 'A design concept, not a live client project.' },
  prototype: { label: 'UI prototype', note: 'Frontend only: the screens show the interface and may not reflect working functionality.' },
  live: { label: 'Live', note: '' },
};

/**
 * Each project lives in its own folder: src/content/projects/<slug>/index.md
 * Images/videos for that project sit next to index.md and are referenced relatively,
 * e.g. `cover: ./cover.jpg`.
 */
const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        tagline: z.string(),
        summary: z.string(),
        /** draft = never built for production. published = public. */
        status: z.enum(['draft', 'published']).default('draft'),
        /** Must be set to true by Jaber once all copy, links and assets are real. */
        verified: z.boolean().default(false),
        category: z.enum(categories),
        kind: z.string(), // e.g. "CRM SaaS", "Clinic website"
        /** concept | prototype | live. Required to publish. */
        stage: z.enum(stages).optional(),
        /** Optional override for the stage explanation shown on the case study. */
        stageNote: z.string().optional(),
        /**
         * Lock that blocks publishing until screenshots are checked for private data
         * (customer names, phone numbers, emails, invoices…). Remove it, or set pending: false, after review.
         */
        privacyReview: z.object({ pending: z.boolean(), note: z.string().optional() }).optional(),
        year: z.string().optional(),
        role: z.string().optional(),
        stack: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        /** Only fill in with a real, consenting client. */
        client: z.string().optional(),
        accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ff6a3d'),
        featured: z.boolean().default(false),
        order: z.number().default(100),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        gallery: z
          .array(
            z.object({
              src: image(),
              alt: z.string(),
              caption: z.string().optional(),
              /** "mobile" shows the shot in a narrow phone-width tile. Auto-detected if omitted. */
              device: z.enum(['desktop', 'mobile']).optional(),
            }),
          )
          .default([]),
        /** Path under /public (e.g. /videos/floowtix.mp4) or an external URL. */
        video: z.object({ src: z.string(), poster: z.string().optional(), caption: z.string().optional() }).optional(),
        links: z
          .object({
            live: z.url().optional(),
            repo: z.url().optional(),
            demo: z.url().optional(),
          })
          .default({}),
        /** Verified results only, e.g. { label: 'Leads handled', value: 'Automated' } */
        outcomes: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      })
      .superRefine((p, ctx) => {
        if (p.status !== 'published') return;
        const problems: string[] = [];
        if (!p.verified) problems.push('`verified: true` is required');
        if (!p.stage) problems.push('a `stage` (concept | prototype | live) is required');
        if (p.privacyReview?.pending) problems.push('screenshots are awaiting a privacy review (`privacyReview.pending: true`)');
        if (!p.cover) problems.push('a `cover` image is required');
        if (p.cover && !p.coverAlt) problems.push('`coverAlt` is required');
        const text = [p.title, p.tagline, p.summary, p.kind, p.role ?? ''].join(' ');
        if (/TODO/i.test(text)) problems.push('title/tagline/summary/kind/role still contain TODO');
        if (problems.length) {
          ctx.addIssue({
            code: 'custom',
            message: `Cannot publish "${p.title}": ${problems.join('; ')}.`,
          });
        }
      }),
});

export const collections = { projects };
