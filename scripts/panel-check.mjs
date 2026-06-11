import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: 'screenshots-verify/one-00-hero.png' });
const panels = ['三つのものさし', '事業内容', '選ばれる理由', '実績', '会社概要', '相談する'];
let i = 1;
for (const label of panels) {
  await page.getByRole('button', { name: label }).first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `screenshots-verify/one-${String(i).padStart(2, '0')}-${i}.png` });
  i++;
}
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshots-verify/one-07-closed.png' });
// モバイル
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await m.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 90000 });
await m.waitForTimeout(3000);
await m.screenshot({ path: 'screenshots-verify/one-m0-hero.png' });
await m.getByRole('button', { name: 'メニュー' }).click();
await m.waitForTimeout(400);
await m.screenshot({ path: 'screenshots-verify/one-m1-menu.png' });
await m.getByRole('button', { name: '事業内容' }).first().click();
await m.waitForTimeout(700);
await m.screenshot({ path: 'screenshots-verify/one-m2-business.png' });
await browser.close();
console.log('ok');
