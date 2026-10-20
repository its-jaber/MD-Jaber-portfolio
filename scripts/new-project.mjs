#!/usr/bin/env node
// Scaffold a new draft project: npm run new:project -- <slug> "<Title>" [Product|Website|Automation]
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [slug, title, category = 'Website'] = process.argv.slice(2);

if (!slug || !title || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run new:project -- <kebab-slug> "<Title>" [Product|Website|Automation]');
  process.exit(1);
}
if (!['Product', 'Website', 'Automation'].includes(category)) {
  console.error(`Unknown category "${category}". Use Product, Website or Automation.`);
  process.exit(1);
}

const dir = join(root, 'src/content/projects', slug);
if (existsSync(dir)) {
  console.error(`src/content/projects/${slug} already exists.`);
  process.exit(1);
}

const md = readFileSync(join(root, 'scripts/templates/project.md'), 'utf8')
  .replaceAll('{{TITLE}}', title.replaceAll('"', '\\"'))
  .replaceAll('{{CATEGORY}}', category)
  .replaceAll('{{KIND}}', 'TODO: e.g. Clinic website')
  .replaceAll('{{ACCENT}}', '#ff6a3d')
  .replaceAll('{{SLUG}}', slug);

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'index.md'), md);
console.log(`Created src/content/projects/${slug}/index.md (draft).`);
console.log(`Put screenshots in that folder and videos in public/videos/, then run: npm run dev`);
