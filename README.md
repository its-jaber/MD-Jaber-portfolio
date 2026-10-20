# Md Jaber · Portfolio

A cinematic, animated personal portfolio. Static site built with **Astro** and
**React islands** animated with **Framer Motion**. No backend, no paid services.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321 (shows draft projects)
npm run build     # type-check + production build into dist/ (published projects only)
npm run preview   # serve dist/ at http://localhost:4321
```

Private preview build including drafts: `SHOW_DRAFTS=true npm run build`.
Never deploy that build publicly.

## Where things live

| What | File |
|---|---|
| Name, email, socials, all personal copy | `src/config/site.ts` |
| Colours, fonts, spacing (design tokens) | `src/styles/global.css` (`:root`) |
| Section/component styles | `src/styles/components.css` |
| Portrait | `src/assets/portrait.jpg` |
| Projects + case studies | `src/content/projects/<slug>/index.md` |
| Project schema + publish guard | `src/content.config.ts` |
| Home page | `src/pages/index.astro` |
| Project Explorer page / case-study template | `src/pages/work/index.astro`, `src/pages/work/[slug].astro` |
| Animated islands (Framer Motion) | `src/components/react/` |

Adding and publishing projects: **[docs/IMPORTING_PROJECTS.md](docs/IMPORTING_PROJECTS.md)**.

## Design notes

- Dark, cinematic palette: one warm accent (`--accent`) plus a per-project accent.
- Type: Inter Tight (UI/headlines) and Instrument Serif italic (accents), self-hosted via Fontsource.
- Motion: masked line reveals, clip-path portrait reveal, scroll parallax, pointer tilt,
  spotlight cards, magnetic buttons, spring cursor, shared-layout filter chips, and
  view-transition page changes. All of it respects `prefers-reduced-motion`.
- Project Explorer filter adapted from the 21st.dev "Filter Grid" pattern (accessible
  radiogroup, live counts, `popLayout` reflow, aria-live summary).
- Projects without real screenshots show an abstract accent placeholder labelled
  "Visuals coming soon", never a fake screenshot.

## Before deploying

1. Set `site` in `astro.config.mjs` to the real domain.
2. Check every `TODO(verify)` in `src/config/site.ts`.
3. Add social URLs (empty ones are hidden).
4. `npm run build`, then deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
