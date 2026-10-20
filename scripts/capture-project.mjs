#!/usr/bin/env node
/**
 * Captures authentic screenshots of a published project page into the private,
 * git-ignored asset-inbox/ (never committed).
 *
 *   npm run capture -- <url> <name> [folder]
 *   npm run capture -- https://wellclean.lovable.app/ wellclean design-concepts
 *
 * Produces, at the page's real rendering (no upscaling, no edits):
 *   <name>-desktop-1440.png   1440×900 viewport, top of the page
 *   <name>-full-1440.png      full page at 1440px wide
 *   <name>-mobile-390.png     390×844 viewport at 2× pixel density (780px file)
 *   <name>-capture.json       URL, time and settings, as a record of where the images came from
 *
 * First run on a new computer: npx playwright install chromium
 * Or skip that download and use a browser that is already installed:
 *   npm run capture -- <url> <name> --browser=msedge     (Microsoft Edge, on every Windows PC)
 *   npm run capture -- <url> <name> --browser=chrome     (Google Chrome)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const channel = args.find((a) => a.startsWith('--browser='))?.split('=')[1];
const [url, name, folder = 'design-concepts'] = args.filter((a) => !a.startsWith('--'));
if (!url || !name || !/^https?:\/\//.test(url) || !/^[a-z0-9-]+$/.test(name)) {
  console.error('Usage: npm run capture -- <https://url> <kebab-name> [asset-inbox subfolder]');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'asset-inbox', folder);
mkdirSync(out, { recursive: true });

const MAX_FULL_HEIGHT = 16000; // keep files a sensible size

/** Scroll through the page so lazy images and scroll-triggered animations settle, then return to the top. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
    scrollTo(0, 0);
  });
  await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))));
  await page.waitForTimeout(1200);
}

/**
 * Full-page capture by scrolling: one viewport-sized shot per position (so scroll-triggered
 * sections have animated in), stitched top to bottom. Fixed bars and sticky headers are
 * hidden after the first segment so they don't repeat down the image.
 */
async function capturePage(page, path) {
  const { vh, total } = await page.evaluate(() => ({ vh: innerHeight, total: document.documentElement.scrollHeight }));
  const height = Math.min(total, MAX_FULL_HEIGHT);
  const parts = [];
  for (let y = 0, i = 0; y < height; y += vh, i++) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(1100); // let reveal animations finish
    const actual = await page.evaluate(() => scrollY); // the last segment may stop short of y
    const buf = await page.screenshot();
    const skip = y - actual; // rows already covered by the previous segment
    const rows = Math.min(vh - skip, height - y);
    parts.push({ buf, top: y, skip, rows });
    if (i === 0) {
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          const pos = getComputedStyle(el).position;
          const r = el.getBoundingClientRect();
          // fixed bars, and sticky elements acting as a header (pinned to the top, short)
          const header = pos === 'sticky' && r.top <= 1 && r.height < 200;
          if (pos === 'fixed' || header) el.style.setProperty('visibility', 'hidden', 'important');
        }
      });
    }
  }
  const scale = (await sharp(parts[0].buf).metadata()).width / 1440;
  const layers = await Promise.all(
    parts.map(async (p) => ({
      input: await sharp(p.buf).extract({ left: 0, top: Math.round(p.skip * scale), width: Math.round(1440 * scale), height: Math.round(p.rows * scale) }).toBuffer(),
      left: 0,
      top: Math.round(p.top * scale),
    })),
  );
  await sharp({ create: { width: Math.round(1440 * scale), height: Math.round(height * scale), channels: 3, background: '#ffffff' } })
    .composite(layers)
    .png()
    .toFile(path);
  await page.evaluate(() => scrollTo(0, 0));
  return { pageHeight: total, truncated: total > MAX_FULL_HEIGHT, segments: parts.length };
}

const browser = await chromium.launch(channel ? { channel } : {}).catch((err) => {
  console.error(channel ? `Could not start ${channel}: ${err.message.split('\n')[0]}` : `Could not start Chromium. Run "npx playwright install chromium", or add --browser=msedge to use Microsoft Edge.`);
  process.exit(1);
});
const record = { url, capturedAt: new Date().toISOString(), browser: channel ?? 'playwright chromium', files: [] };
try {
  // Desktop: viewport + full page
  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const res = await desk.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!res || !res.ok()) throw new Error(`Page answered ${res ? res.status() : 'no response'}`);
  await settle(desk);
  const top = join(out, `${name}-desktop-1440.png`);
  await desk.screenshot({ path: top });
  record.files.push({ file: `${name}-desktop-1440.png`, viewport: '1440x900', scale: 1 });

  const full = await capturePage(desk, join(out, `${name}-full-1440.png`));
  record.files.push({ file: `${name}-full-1440.png`, viewport: '1440 wide', method: 'scrolled segments, stitched; fixed header shown once', ...full, scale: 1 });
  await desk.close();

  // Mobile: 390px viewport at 2× density
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mob.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(mob);
  await mob.screenshot({ path: join(out, `${name}-mobile-390.png`) });
  record.files.push({ file: `${name}-mobile-390.png`, viewport: '390x844', scale: 2 });
  await mob.close();

  writeFileSync(join(out, `${name}-capture.json`), JSON.stringify(record, null, 2) + '\n');
  console.log(`Saved to asset-inbox/${folder}/:`);
  for (const f of record.files) console.log(`  ${f.file}`);
} catch (err) {
  console.error(`Capture failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
