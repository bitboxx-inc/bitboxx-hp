/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				cream: {
					50: '#FFFFFF',
					100: '#F6F6F4',
					200: '#ECEBE7',
					300: '#D9D8D2'
				},
				ink: {
					DEFAULT: '#111014',
					700: '#2A272F',
					500: '#4B4752'
				},
				// アクセントは #FF2630 のみ (FF + 26 + 30 — 役員誕生日由来)。差し替え不可。
				sakura: {
					DEFAULT: '#FF2630',
					soft: '#FF6B72'
				}
			},
			fontFamily: {
				sans: [
					'"Space Grotesk"',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Helvetica Neue"',
					'"Noto Sans JP"',
					'"Hiragino Kaku Gothic ProN"',
					'system-ui',
					'sans-serif'
				],
				display: [
					'"Fraunces"',
					'ui-serif',
					'Georgia',
					'"Hiragino Mincho ProN"',
					'"Noto Serif JP"',
					'serif'
				],
				mincho: ['"Noto Serif JP"', '"Hiragino Mincho ProN"', 'ui-serif', 'serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace']
			},
			letterSpacing: {
				hyper: '-0.04em'
			}
		}
	},
	plugins: []
};
