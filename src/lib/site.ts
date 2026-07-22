// サイト全体で共有するメタ情報の一次ソース。
// canonical / OGP / sitemap / robots / JSON-LD がすべてここを参照する。
// 本番ドメインを変えるときは SITE_URL の一箇所だけ直せばよい。

/** 末尾スラッシュ付きの本番オリジン。 */
export const SITE_URL = 'https://bitboxx.co.jp/';

/** 正式社名 (= <title> / og:site_name に出す表記)。 */
export const SITE_NAME = '株式会社bitboxx';

/** 検索エンジンが同一サイトと認識できるよう、表記ゆれを別名として渡す。 */
export const SITE_ALT_NAMES = ['bitboxx', 'ビットボックス'];

/** 問い合わせ先。mailto / JSON-LD で共用。 */
export const CONTACT_EMAIL = 'contact@bitboxx.co.jp';

/** 末尾スラッシュを一つに正規化して絶対 URL を組み立てる。 */
export function abs(path = ''): string {
	return SITE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
