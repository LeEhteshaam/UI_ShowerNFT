<script lang="ts">
	import '../app.css';
	import { view } from '$lib/stores';
	import Hero from '$lib/components/Hero.svelte';
	import Tutorial from '$lib/components/Tutorial.svelte';
	import Verification from '$lib/components/Verification.svelte';
	import MiniGame from '$lib/components/MiniGame.svelte';
	import Minting from '$lib/components/Minting.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Complete from '$lib/components/Complete.svelte';

	const components = {
		hero: Hero,
		tutorial: Tutorial,
		verification: Verification,
		minigame: MiniGame,
		minting: Minting,
		loading: Loading,
		complete: Complete
	};
</script>

<main class="bg-gray-100 text-gray-900 min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 md:p-12 mx-auto">
		<svelte:component this={components[$view]} />
	</div>
</main>
