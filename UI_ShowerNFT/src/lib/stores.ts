import { writable } from 'svelte/store';

export const view = writable('hero');

export const totalTime = writable(300);
export const showerThought = writable('');

// Re-export Web3/Wallet stores from web3.ts to avoid duplication
export { walletAddress } from './web3';
export const mintedTokenId = writable<number | null>(null);
export const mintTxHash = writable<string | null>(null);

export function showView(viewName: string) {
    view.set(viewName);
}
