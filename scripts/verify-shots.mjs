// Quick visual verification: scroll-through viewport screenshots against the
// preview server (Reveal animations need real scrolling to fire).
// Run: node scripts/verify-shots.mjs (expects `vite preview` on :4173)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
];
for (const t of targets) {
  const page = await browser.newPage({ viewport: t.viewport, isMobile: t.isMobile, hasTouch: t.hasTouch });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // deferred hero canvas + fonts

  const total = await page.evaluate(() => document.body.scrollHeight);
  const step = t.viewport.height;
  let shot = 0;
  for (let y = 0; y < total; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(1100); // reveal transition
    await page.screenshot({
      path: `screenshots-verify/${t.name}-${String(shot).padStart(2, '0')}.png`
    });
    shot++;
  }
  await page.close();
  console.log(`wrote ${shot} ${t.name} shots`);
}
await browser.close();
