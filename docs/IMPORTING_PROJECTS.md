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

Current drafts (all unpublished):

| Slug | Project | Stage label |
|---|---|---|
| `fitness-gym-website` | Fitness/Gym Website | Concept |
| `wellclean-website` | WellClean Website | Concept |
| `bebshaflow-free-kit` | BebshaFlow Free Kit (landing page) | Concept |
| `fitkhabar-ai` | FitKhabar AI (frontend) | UI prototype |
| `floowtix-crm` | FloowTix CRM | not set · **privacy lock on** |
| `n8n-automation` | n8n automation case studies | not set |
| `doctor-website`, `plumbing-website` | older placeholders | not set |

Every `TODO` in them is a gap to fill with **real** information.

TODO text is never shown on the site. In the dev preview, an empty field is simply
hidden, and a `TODO` paragraph in the case study shows as a dashed "Content pending"
slot. Every visual sits in a browser-style frame: without a screenshot it shows an
abstract category graphic, and with one it frames your image, so the layout doesn't
change when real assets arrive.

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

**Stage label (required to publish).** `stage: concept | prototype | live`. It is shown on
the card and the case study ("Concept: a design concept, not a live client project." /
"UI prototype: frontend only…"). Override the sentence with `stageNote:` if needed.

**Privacy lock.** Projects with private data in screenshots (e.g. FloowTix CRM) carry:

```yaml
privacyReview:
  pending: true
  note: "Check for customer names, phone numbers, emails…"
```

The build refuses to publish while `pending: true`. Blur or crop private data, then remove the block.

**Screenshots.** Every cover and gallery image opens a fullscreen viewer (←/→, swipe, Esc).
Full-page screenshots (taller than wide) are cropped to the top in the gallery with a
"View full page" hint and scroll vertically in the viewer. Phone screenshots get narrow
tiles automatically; force it with `device: mobile` (or `device: desktop`) on a gallery item.
Export PNG or high-quality JPG at real size (desktop ≈1440–1920px wide); the site generates
WebP sizes and lazy-loads them.

## 3. Write the case study

Replace each `TODO` paragraph under the headings (Overview, The problem, What I built,
Process, Result). It's plain Markdown, so add headings, lists, quotes or images freely.

## 4. Preview

```bash
npm run dev            # http://localhost:4321, drafts shown with a small “Draft” label
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

- **A project disappeared from the dev server after a build error.** Run
  `npx astro dev stop`, delete the `.astro/` folder, then `npm run dev` again. Astro
  caches content and can hold on to the failed entry.
- **"Dev server running" but nothing opens.** Astro 7 runs the dev server in the
  background. Use `npx astro dev status`, `npx astro dev logs` or `npx astro dev stop`.
- **Image not found.** Paths in frontmatter are relative to `index.md` (start with `./`).
