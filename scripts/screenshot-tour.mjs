// Auto-tour the production preview at multiple viewport widths, scrolling
// through the document and writing PNGs to ./screenshots/. Output filenames
// are zero-padded so the natural sort matches scroll progression.
//
// Usage:
//   node scripts/screenshot-tour.mjs            # uses http://localhost:5273
//   URL=http://localhost:5174 node scripts/screenshot-tour.mjs
//   STEPS=18 node scripts/screenshot-tour.mjs   # override step count

import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = process.env.URL || 'http://localhost:5273';
const STEPS = Number(process.env.STEPS || 14);
const OUT_DIR = join(process.cwd(), 'screenshots');

const VIEWPORTS = [
	{ name: 'mobile-iphone13', width: 390, height: 844, dsf: 2 },
	{ name: 'mobile-narrow', width: 360, height: 780, dsf: 2 },
	{ name: 'tablet-portrait', width: 768, height: 1024, dsf: 2 },
	{ name: 'desktop', width: 1440, height: 900, dsf: 1 }
];

const pad = (n, len = 2) => String(n).padStart(len, '0');

async function waitFonts(page) {
	await page.evaluate(() =>
		document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
	);
}

async function tourViewport(browser, vp) {
	const ctx = await browser.newContext({
		viewport: { width: vp.width, height: vp.height },
		deviceScaleFactor: vp.dsf,
		reducedMotion: 'no-preference'
	});
	const page = await ctx.newPage();

	page.on('pageerror', (err) => console.error(`[${vp.name}] pageerror:`, err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') console.error(`[${vp.name}] console.error:`, msg.text());
	});

	console.log(`→ ${vp.name} (${vp.width}×${vp.height})`);
	const res = await page.goto(BASE_URL, { waitUntil: 'load' });
	if (!res || !res.ok()) {
		console.error(`  failed: ${res ? res.status() : 'no response'}`);
		await ctx.close();
		return;
	}
	await waitFonts(page);
	await page.waitForTimeout(900); // let hero canvas/particle layers settle

	const docHeight = await page.evaluate(() =>
		Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
	);
	const scrollMax = Math.max(0, docHeight - vp.height);
	console.log(`  doc: ${docHeight}px, scrollMax: ${scrollMax}px`);

	for (let i = 0; i < STEPS; i++) {
		const ratio = STEPS === 1 ? 0 : i / (STEPS - 1);
		const y = Math.round(scrollMax * ratio);
		await page.evaluate((ty) => window.scrollTo(0, ty), y);
		await page.waitForTimeout(450); // canvas + sticky settle
		const file = join(OUT_DIR, `${vp.name}-${pad(i)}-y${pad(y, 5)}.png`);
		await page.screenshot({ path: file, fullPage: false });
		process.stdout.write('.');
	}
	process.stdout.write('\n');
	await ctx.close();
}

async function main() {
	await rm(OUT_DIR, { recursive: true, force: true });
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	try {
		for (const vp of VIEWPORTS) {
			await tourViewport(browser, vp);
		}
	} finally {
		await browser.close();
	}
	console.log(`done. screenshots in ${OUT_DIR}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
