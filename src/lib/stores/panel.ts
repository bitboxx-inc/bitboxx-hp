import { writable } from 'svelte/store';

/** 一枚絵サイトのコンテンツパネル。null = パネルなし (素の一枚絵)。 */
export type PanelId = 'philosophy' | 'business' | 'reasons' | 'works' | 'company' | 'contact';
export const activePanel = writable<PanelId | null>(null);
