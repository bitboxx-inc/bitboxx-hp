// お知らせ (NEWS) のデータ管理。
// ../omega-hp の svelte 資源と同じ「Markdown ファイル + import.meta.glob」方式を踏襲する。
//
// 記事の追加はファイルを置くだけ:
//   src/lib/news/<yyyy>/<MM>/<dd-連番>/index.md
// 例) src/lib/news/2026/07/22-01/index.md
//
// フォーマット (先頭に frontmatter、その下が本文):
//   ---
//   date: 2026.07.22        ← YYYY.MM.DD (ゼロ埋めは任意、表示時に揃える)
//   title: 見出し
//   category: RELEASE       ← 任意。あれば赤い縦罫のタグとして出る
//   ---
//   本文をここに。空行で段落が分かれる。<p> などの HTML を直接書いてもよい。
//
// 依存は増やさない (omega-hp は marked を使うが、当サイトの本文は短い告知なので
// 素のテキスト→段落化 + HTML 素通しの軽量変換で足りる)。

export type NewsItem = {
	date: string; // 表示用 (YYYY.MM.DD にゼロ埋め正規化)
	title: string;
	category?: string; // 任意カテゴリ (RELEASE / NOTICE / MILESTONE …)
	slug: string; // パス由来。例) /news/2026/07/22-01
	sortKey: string; // 並べ替え用 (ゼロ埋め済み)
	html: string; // 段落化した本文 (HTML)
};

// ビルド時に全 index.md の生テキストを取り込む (path → string)。
const modules = import.meta.glob('/src/lib/news/**/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// ごく小さな frontmatter パーサ (omega-hp と同じ手法。依存なし)。
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { meta: {}, body: raw };
	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		const value = line.slice(idx + 1).trim();
		if (key) meta[key] = value;
	}
	return { meta, body: raw.slice(match[0].length) };
}

// YYYY.M.D → YYYY.MM.DD。パースできなければそのまま返す。
function normalizeDate(value: string): string {
	const parts = value.split('.');
	if (parts.length !== 3) return value;
	const [yyyy, mm, dd] = parts;
	if (!yyyy || !mm || !dd) return value;
	return `${yyyy}.${mm.padStart(2, '0')}.${dd.padStart(2, '0')}`;
}

// パス → slug。/src/lib を外し、末尾 /index.md を落とす。
function slugFromPath(path: string): string {
	return path.replace('/src/lib', '').replace(/\/index\.md$/, '');
}

// 本文 → HTML。既にブロック HTML を含むならそのまま、素のテキストなら段落化する。
function bodyToHtml(body: string): string {
	const trimmed = body.trim();
	if (!trimmed) return '';
	if (/<(p|ul|ol|div|h[1-6]|table|blockquote|figure)\b/i.test(trimmed)) return trimmed;
	return trimmed
		.split(/\n\s*\n/)
		.map((para) => `<p>${para.trim().replace(/\n/g, '<br />')}</p>`)
		.join('\n');
}

export const newsIndex: NewsItem[] = Object.entries(modules)
	.map(([path, raw]) => {
		const { meta, body } = parseFrontmatter(raw);
		const rawDate = meta.date ?? '';
		return {
			slug: slugFromPath(path),
			date: normalizeDate(rawDate),
			title: meta.title ?? '',
			category: meta.category || undefined,
			sortKey: normalizeDate(rawDate),
			html: bodyToHtml(body)
		};
	})
	.filter((item) => item.slug && item.date && item.title)
	// 新着順 (数字のみの文字列比較で降順)
	.sort((a, b) => b.sortKey.replace(/\D/g, '').localeCompare(a.sortKey.replace(/\D/g, '')));

/** 最新 n 件。 */
export function latestNews(n: number): NewsItem[] {
	return newsIndex.slice(0, n);
}
