# Importing & publishing projects

Every project is a folder in `src/content/projects/`:

```
src/content/projects/floowtix-crm/
├── index.md        ← details (frontmatter) + case study (markdown body)
├── cover.jpg       ← screenshots sit next to index.md
├── dashboard.jpg
└── mobile.jpg
public/videos/
└── floowtix-crm.mp4   ← videos go in public/ (served as-is)
```

Six drafts already exist: `floowtix-crm`, `bebshaflow`, `n8n-automation`,
`doctor-website`, `plumbing-website`, `gym-website`. Every `TODO` in them is a gap
to fill with **real** information.

## 1. Add a new project (optional)

```bash
npm run new:project -- my-project-slug "My Project Title" Website   # Product | Website | Automation
```

## 2. Add assets

| Asset | Where | Notes |
|---|---|---|
| Cover (required to publish) | `src/content/projects/<slug>/cover.jpg` | 16:10 or wider, ≥ 1600px wide. Auto-converted to WebP/responsive sizes. |
| Gallery screenshots | same folder | Any number. JPG/PNG/WebP. |
| Demo video | `public/videos/<slug>.mp4` | H.264 MP4, keep under ~15 MB. Optional poster image in the same folder. |
| Live / demo / repo links | frontmatter `links:` | Must be full `https://` URLs. |

Then uncomment and fill in the frontmatter:

```yaml
cover: ./cover.jpg
coverAlt: "FloowTix CRM dashboard showing the lead pipeline"
gallery:
  - src: ./dashboard.jpg
    alt: "Dashboard overview"
    caption: "Pipeline view"
video:
  src: /videos/floowtix-crm.mp4
  poster: /videos/floowtix-crm-poster.jpg
links:
  live: https://example.com
year: "2025"
stack: ["Next.js", "Supabase", "n8n"]
tags: ["CRM", "Automation"]
```

Only add `client:` or `outcomes:` when they are real and you have permission to show them.

## 3. Write the case study

Replace each `TODO` paragraph under the headings (Overview, The problem, What I built,
Process, Result). It's plain Markdown, so add headings, lists, quotes or images freely.

## 4. Preview

```bash
npm run dev            # http://localhost:4321, drafts shown with a DRAFT badge
```

## 5. Publish

When everything is true and complete, set:

```yaml
status: published
verified: true
```

The build **refuses to publish** a project if it is not `verified`, has no cover or
cover alt text, or still contains `TODO` anywhere (frontmatter or body).
`npm run build` then includes the project on `/work`, on the home page if
`featured: true`, and at `/work/<slug>`.

Other useful fields: `featured` (show on the home page), `order` (lower = earlier),
`accent` (hex colour used for that project's glow and placeholder).

## Troubleshooting

- **A project disappeared from the dev server after a build error.** Stop the dev
  server, delete the `.astro/` folder, and start `npm run dev` again. Astro caches
  content and can hold on to the failed entry.
- **Image not found.** Paths in frontmatter are relative to `index.md` (start with `./`).
