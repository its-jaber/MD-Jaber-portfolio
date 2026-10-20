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
| `fitness-gym-website` | Fitness/Gym Website | Concept · screenshot in inbox |
| `wellclean-website` | WellClean Website | Concept · screenshot in inbox |
| `bebshaflow-free-kit` | BebshaFlow Free Kit (landing page) | Concept · screenshot in inbox |
| `fitkhabar-ai` | FitKhabar AI (frontend) | UI prototype · screenshot in inbox |
| `pill-tracker` | Pill Tracker | UI prototype (functionality unverified) · screenshot in inbox |
| `floowtix-crm` | FloowTix CRM | not set · **privacy lock on** |
| `n8n-automation` | n8n automation case studies | not set |
| `doctor-website`, `plumbing-website` | older placeholders | not set |

Every `TODO` in them is a gap to fill with **real** information.

TODO text is never shown on the site. In the dev preview, an empty field is simply
hidden, and a `TODO` paragraph in the case study shows as a dashed "Content pending"
slot. Every visual sits in a browser-style frame: without a screenshot it shows an
abstract category graphic, and with one it frames your image, so the layout doesn't
change when real assets arrive.

## Private screenshots: `asset-inbox/`

Unreviewed screenshots live in `asset-inbox/` at the repo root (same layout as the asset
starter pack: `design-concepts/`, `ui-prototypes/`, `private-review/`). The folder is
**git-ignored**, so it is never committed or pushed. Drafts point at it, e.g.

```yaml
cover: ../../../../asset-inbox/design-concepts/fitness-gym-lovable-long.png
```

- In `npm run dev` (and `SHOW_DRAFTS=true` previews) these images show normally.
- A public `npm run build` never reads the inbox, so no inbox file can end up in `dist/`.
- If the file is missing (e.g. on another computer), the card shows the abstract frame
  instead of failing the build.
- Publishing is refused while a project still points at `asset-inbox/`: copy the
  approved, optimised image next to `index.md`, change the path to `./cover.png`, then publish.

Screenshots narrower than 800px are shown at their real size (never stretched). Long
full-page captures get a scrollable preview on desktop and open fullscreen on touch.

## Capturing a published project

For projects with a live URL (e.g. a Lovable build), capture authentic screenshots instead
of exporting them by hand:

```bash
npx playwright install chromium        # once per computer
npm run capture -- https://wellclean.lovable.app/ wellclean design-concepts
```

No download needed on Windows: add `--browser=msedge` to use the Microsoft Edge that is
already installed (or `--browser=chrome` for Google Chrome):

```bash
npm run capture -- https://wellclean.lovable.app/ wellclean --browser=msedge
```

This saves into the git-ignored `asset-inbox/design-concepts/`:

| File | What |
|---|---|
| `wellclean-desktop-1440.png` | 1440×900 desktop viewport (top of the page) |
| `wellclean-full-1440.png` | Full page at 1440px wide, captured in scrolled segments so scroll animations have played, then stitched; the fixed header appears once |
| `wellclean-mobile-390.png` | 390×844 mobile viewport at 2× density (780px file) |
| `wellclean-capture.json` | URL, time and settings, as a record of where the images came from |

Nothing is edited or upscaled. Review the images before pointing a draft at them.

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
