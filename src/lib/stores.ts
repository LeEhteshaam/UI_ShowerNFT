import { writable } from 'svelte/store';

export const view = writable('hero');

export const totalTime = writable(300);
export const showerThought = writable('');

export function showView(viewName: string) {
    view.set(viewName);
}
