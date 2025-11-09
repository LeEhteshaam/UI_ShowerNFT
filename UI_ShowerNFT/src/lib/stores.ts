import { writable } from 'svelte/store';
import type { GestureType } from './ml/poseDetector';

export const view = writable('hero');

export const totalTime = writable(300);
export const showerThought = writable('');

export const tutorialCompleted = writable(false);

// Pose detection - raw poses from MoveNet
export const currentPoses = writable<any[]>([]);

// Current gesture being tested (set by ShowerStep)
export const targetGesture = writable<GestureType | null>(null);

// Gesture analysis result - computed by poseDetector, consumed by ShowerStep
export const gestureAnalysis = writable<{
    isActive: boolean;
    confidence: number;
    gesture: GestureType | null;
}>({ isActive: false, confidence: 0, gesture: null });

// Re-export Web3/Wallet stores from web3.ts to avoid duplication
export { walletAddress } from './web3';
export const mintedTokenId = writable<number | null>(null);
export const mintTxHash = writable<string | null>(null);

export function showView(viewName: string) {
    view.set(viewName);
}
