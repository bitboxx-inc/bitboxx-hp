// ヒーローの墨流しを時系列でキャプチャする検証スクリプト。
// 読み込み直後 → 演出中 → 演出後 → マウスで掻いた後 の順に PNG を書き出す。
// Usage: node scripts/hero-frames.mjs  (URL / OUT 環境変数で上書き可)

import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = process.env.URL || 'http://localhost:5273';
const OUT_DIR = process.env.OUT || join(process.cwd(), 'screenshots-hero');

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-gpu'] });

async function capture(name, width, height, dsf, interact) {
	const ctx = await browser.newContext({
		viewport: { width, height },
		deviceScaleFactor: dsf,
		reducedMotion: 'no-preference'
	});
	const page = await ctx.newPage();
	page.on('pageerror', (err) => console.error(`[${name}] pageerror:`, err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') console.error(`[${name}] console.error:`, msg.text());
	});
	await page.goto(BASE_URL, { waitUntil: 'load' });
	await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());

	const shots = [
		[900, '01-early'],
		[1500, '02-target'],
		[1700, '03-grown'],
		[1800, '04-marbled'],
		[2200, '05-settled']
	];
	for (const [wait, label] of shots) {
		await page.waitForTimeout(wait);

		await page.screenshot({ path: join(OUT_DIR, `${name}-${label}.png`) });
	}

	if (interact) {
		// マウスで S 字に掻く
		await page.mouse.move(width * 0.2, height * 0.7);
		for (let i = 0; i <= 30; i++) {
			const t = i / 30;
			await page.mouse.move(
				width * (0.2 + t * 0.6),
				height * (0.7 - Math.sin(t * Math.PI * 2) * 0.25 - t * 0.3),
				{ steps: 2 }
			);
			await page.waitForTimeout(16);
		}
		await page.waitForTimeout(700);
		await page.screenshot({ path: join(OUT_DIR, `${name}-05-stirred.png`) });
		// クリックで一滴
		await page.mouse.click(width * 0.45, height * 0.55);
		await page.waitForTimeout(900);
		await page.screenshot({ path: join(OUT_DIR, `${name}-06-drop.png`) });
	}

	await ctx.close();
}

await capture('desktop', 1440, 900, 1, true);
await capture('mobile', 390, 844, 2, false);

await browser.close();
console.log(`done → ${OUT_DIR}`);
