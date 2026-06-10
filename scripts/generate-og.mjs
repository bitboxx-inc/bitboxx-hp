// Generates static/og.png (1200x630) and static/apple-touch-icon.png (180x180).
// Run: node scripts/generate-og.mjs
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logoSvg = readFileSync(resolve(root, 'static/black.svg'), 'utf8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;

const ogHtml = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Noto+Serif+JP:wght@300&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: #FFFFFF; color: #111014;
    font-family: 'Fraunces', serif; overflow: hidden; position: relative;
    padding: 64px 72px;
  }
  .word { font-size: 138px; letter-spacing: -0.04em; line-height: 0.94; display: block; }
  .ex { font-style: italic; }
  .ex .u {
    background-image: linear-gradient(transparent 72%, #FF2630 72%, #FF2630 94%, transparent 94%);
    padding: 0 .1em;
  }
  .ka { font-style: italic; color: #FF2630; padding-left: 170px; }
  .un { padding-left: 56px; }
  .un .dot { color: #FF2630; }
  .tagline {
    position: absolute; left: 78px; bottom: 76px;
    font-family: 'Noto Serif JP', serif; font-weight: 300;
    font-size: 33px; letter-spacing: 0.06em; color: rgba(17,16,20,0.78);
  }
  .logo { position: absolute; right: 76px; bottom: 76px; height: 42px; }
</style></head>
<body>
  <h1>
    <span class="word ex"><span class="u">Excellent.</span></span>
    <span class="word ka">Kawaii.</span>
    <span class="word un">Unique<span class="dot">.</span></span>
  </h1>
  <p class="tagline">まだ見ぬ最高を、確かな品質で。</p>
  <img class="logo" src="${logoDataUri}" alt="bitboxx">
</body></html>`;

const iconHtml = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,600&display=block" rel="stylesheet">
<style>
  * { margin: 0; }
  body {
    width: 180px; height: 180px; background: #FFFFFF;
    display: grid; place-items: center; overflow: hidden;
  }
  span { font-family: 'Fraunces', serif; font-style: italic; font-weight: 600;
    font-size: 116px; letter-spacing: -0.04em; color: #111014; transform: translateY(-8px); }
  i { font-style: italic; color: #FF2630; }
</style></head>
<body><span>b<i>.</i></span></body></html>`;

const browser = await chromium.launch();
for (const [html, size, out] of [
  [ogHtml, { width: 1200, height: 630 }, 'static/og.png'],
  [iconHtml, { width: 180, height: 180 }, 'static/apple-touch-icon.png']
]) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(root, out) });
  await page.close();
  console.log(`wrote ${out}`);
}
await browser.close();
