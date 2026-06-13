import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	// ヒーローは WebGL (three.js)。ヘッドレスでも描画させるため software GL を許可。
	use: {
		launchOptions: {
			args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
		}
	}
};

export default config;
