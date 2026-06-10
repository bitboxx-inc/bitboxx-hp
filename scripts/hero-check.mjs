import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'screenshots-verify/hero-reveal.png' });
await page.waitForTimeout(4000);
for (let i = 0; i < 30; i++) {
  await page.mouse.move(260 + i * 36, 420 + Math.sin(i * 0.55) * 200, { steps: 4 });
  await page.waitForTimeout(35);
}
await page.waitForTimeout(400);
await page.screenshot({ path: 'screenshots-verify/hero-stirred.png' });
await browser.close();
console.log('ok');
