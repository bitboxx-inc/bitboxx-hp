// 空間ナビ (Orrery) の検証キャプチャ。
// 起動 → アイドル → スクロールで focus 移動 → 着陸 (惑星クリック) → パネル の順に撮る。
// 要: build を配信 (例 cd build && python3 -m http.server 5280)。URL 環境変数で上書き可。
import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = process.env.URL || 'http://localhost:5280';
const OUT = join(process.cwd(), 'screenshots-orrery');
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-gpu'] });

async function run(name, width, height, dsf) {
	const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf });
	const page = await ctx.newPage();
	page.on('pageerror', (e) => console.error(`[${name}] pageerror:`, e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') console.error(`[${name}] console:`, m.text());
	});
	const cx = width / 2,
		cy = height / 2;
	await page.goto(BASE_URL, { waitUntil: 'load' });
	await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
	await page.mouse.move(cx, cy);
	await page.waitForTimeout(900);
	await page.screenshot({ path: join(OUT, `${name}-01-idle.png`) });

	// スクロールで focus を進める
	await page.mouse.wheel(0, 240);
	await page.waitForTimeout(700);
	await page.mouse.move(cx, cy);
	await page.screenshot({ path: join(OUT, `${name}-02-focus2.png`) });
	await page.mouse.wheel(0, 240);
	await page.waitForTimeout(700);
	await page.mouse.move(cx, cy);
	await page.screenshot({ path: join(OUT, `${name}-03-focus3.png`) });

	// カーソルを左右に振ってプレビュー回転
	await page.mouse.move(width * 0.32, cy);
	await page.waitForTimeout(400);
	await page.screenshot({ path: join(OUT, `${name}-04-parallax.png`) });
	await page.mouse.move(cx, cy);
	await page.waitForTimeout(500);

	// 着陸 — focus 中の惑星ラベルをクリック
	await page.locator('.planet-label.is-focused').click({ force: true, timeout: 3000 });
	await page.waitForTimeout(300);
	await page.screenshot({ path: join(OUT, `${name}-05-landing.png`) });
	await page.waitForTimeout(700);
	await page.screenshot({ path: join(OUT, `${name}-06-panel.png`) });
	// パネル内スクロール
	try {
		await page.mouse.move(cx, cy);
		await page.mouse.wheel(0, 500);
		await page.waitForTimeout(400);
		await page.screenshot({ path: join(OUT, `${name}-07-panel-scrolled.png`) });
	} catch (e) {
		console.error(`[${name}] panel scroll:`, e.message);
	}

	await ctx.close();
}

await run('desktop', 1440, 900, 1);
await run('mobile', 390, 844, 2);
await browser.close();
console.log('done →', OUT);
