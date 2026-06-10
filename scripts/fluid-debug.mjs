import { chromium } from '@playwright/test';
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text().slice(0, 160)}`));
await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
const caps = await page.evaluate(() => {
  const c = document.createElement('canvas');
  const g = c.getContext('webgl2');
  const fluid = document.querySelector('main section canvas');
  return {
    webgl2: !!g,
    ext: g ? !!g.getExtension('EXT_color_buffer_float') : null,
    fluidSize: fluid ? [fluid.width, fluid.height] : null,
    canvasCount: document.querySelectorAll('main section canvas').length
  };
});
await page.evaluate(() => {
  document.querySelectorAll('main section canvas').forEach((c, i) => { if (i > 0) c.style.display = 'none'; });
});
for (let i = 0; i < 20; i++) {
  await page.mouse.move(300 + i * 50, 450 + Math.sin(i) * 180, { steps: 3 });
  await page.waitForTimeout(30);
}
await page.waitForTimeout(700);
await page.screenshot({ path: 'screenshots-verify/fluid-only.png' });
console.log(JSON.stringify(caps));
console.log(logs.filter((l) => !l.includes('glBlitFramebuffer')).slice(0, 8).join('\n'));
await browser.close();
