import { writable } from 'svelte/store';

export type HeroGameState = 'idle' | 'ready' | 'playing' | 'gameover';

/** Whether the hero mini-game is currently active. Pages can subscribe
 *  to quiet down surrounding chrome (title, subtitle, etc.) while the
 *  player is hitting cubes. */
export const heroGameState = writable<HeroGameState>('idle');

/** Live score, updated as cubes are hit. */
export const heroGameScore = writable<number>(0);
