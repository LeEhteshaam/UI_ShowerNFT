// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// MetaMask/Ethereum provider types
	interface Window {
		ethereum?: {
			isMetaMask?: boolean;
			request: (args: { method: string; params?: any[] }) => Promise<any>;
			on: (event: string, callback: (...args: any[]) => void) => void;
			removeListener: (event: string, callback: (...args: any[]) => void) => void;
		};
	}
}

export {};
