import { expect, test } from '@playwright/test';

test('home renders the brand and an h1 heading', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/bitboxx/);
	// 見出しはスクリーンリーダー向け (視覚は空間表現が担う)
	await expect(page.locator('h1')).toHaveText(/bitboxx/);
});

test('selecting a planet lands on its section', async ({ page }) => {
	await page.goto('/');
	// ハイドレーション後、focus 中の惑星ラベルが現れる
	const focused = page.locator('.planet-label.is-focused');
	await focused.waitFor({ state: 'visible', timeout: 5000 });
	await focused.click();
	// 着陸先のデジタルウィンドウに「戻る」操作が出る
	await expect(page.getByRole('button', { name: '← 戻る' })).toBeVisible({ timeout: 5000 });
});
