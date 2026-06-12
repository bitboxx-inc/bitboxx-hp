// Generates static/og.png (1200x630) and static/apple-touch-icon.png (180x180).
// OG は実物のヒーロー (墨流し) を reduced-motion で静止キャプチャする。
// 先にビルドを配信しておくこと:
//   pnpm build && (cd build && python3 -m http.server 5280 &)
//   node scripts/generate-og.mjs            # URL 環境変数で上書き可
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.URL || 'http://localhost:5280';

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

const browser = await chromium.launch({ args: ['--enable-gpu'] });

// ── og.png — 実物のヒーローを静止キャプチャ ──
{
	const ctx = await browser.newContext({
		viewport: { width: 1200, height: 630 },
		deviceScaleFactor: 1,
		reducedMotion: 'reduce' // 紋様が一発で完成した状態になる
	});
	const page = await ctx.newPage();
	await page.goto(BASE_URL, { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	// OG にサイトの操作 UI は不要 — ヘッダーと連絡カードを隠す
	await page.addStyleTag({
		content: 'header, section a[href="#contact-form"] { display: none !important; }'
	});
	await page.waitForTimeout(1200);
	await page.screenshot({ path: resolve(root, 'static/og.png') });
	await ctx.close();
	console.log('wrote static/og.png');
}

// ── apple-touch-icon.png ──
{
	const page = await browser.newPage({
		viewport: { width: 180, height: 180 },
		deviceScaleFactor: 1
	});
	await page.setContent(iconHtml, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: resolve(root, 'static/apple-touch-icon.png') });
	await page.close();
	console.log('wrote static/apple-touch-icon.png');
}
await browser.close();
