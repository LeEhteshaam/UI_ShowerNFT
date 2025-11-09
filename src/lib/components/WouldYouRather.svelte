<script lang="ts">
	import { showView } from '$lib/stores';
	import { onMount } from 'svelte';

	// --- Data ---
	const questions = [
		{ title: 'WOULD YOU RATHER', left: 'Always use 17-in-1 shampoo', right: 'Never use shampoo again' },
		{ title: 'WOULD YOU RATHER', left: 'Only shower in motor oil permanently', right: 'Never shower again' },
		{ title: 'WOULD YOU RATHER', left: 'Only shower in the morning', right: 'Only shower at night' },
		{
			title: 'WOULD YOU RATHER',
			left: 'Forced to shower less than 5 minutes a day',
			right: 'Forced to shower more than an hour a day'
		},
		{ title: 'WOULD YOU RATHER', left: 'Never use conditioner again', right: 'Never use body wash again' },
		{
			title: 'WOULD YOU RATHER',
			left: 'Never sing in the shower again',
			right: 'Every time you sing everyone in the house can hear you'
		}
	];

	// --- State ---
	let currentQuestion: (typeof questions)[0] | null = null;
	let availableQuestions: typeof questions = [];
	let roundsPlayed = 0;
	const roundsTotal = 3;
	let selectedSide: 'left' | 'right' | null = null;
	let gameEnded = false;
	let summary: { question: any; choice: string }[] = [];

	// --- Lifecycle ---
	onMount(() => {
		startGame();
	});

	// --- Game Logic ---
	function startGame() {
		availableQuestions = [...questions];
		roundsPlayed = 0;
		summary = [];
		gameEnded = false;
		nextQuestion();
	}

	function nextQuestion() {
		selectedSide = null;
		if (roundsPlayed >= roundsTotal) {
			finishGame();
			return;
		}

		const randomIndex = Math.floor(Math.random() * availableQuestions.length);
		currentQuestion = availableQuestions.splice(randomIndex, 1)[0];
	}

	function handleChoice(side: 'left' | 'right') {
		if (selectedSide) return; // Prevent changing choice

		selectedSide = side;
		summary.push({
			question: currentQuestion,
			choice: side === 'left' ? currentQuestion!.left : currentQuestion!.right
		});
		roundsPlayed++;

		setTimeout(() => {
			nextQuestion();
		}, 800); // Wait a bit before showing the next question
	}

	function finishGame() {
		gameEnded = true;
		// After showing the summary for a few seconds, move to the next view
		setTimeout(() => {
			showView('minting');
		}, 4000);
	}
</script>

<div class="app-view space-y-6 text-center">
	{#if gameEnded}
		<div class="bg-gray-100 p-6 rounded-lg shadow-inner text-left">
			<h2 class="text-2xl font-bold text-center mb-4">Game Over!</h2>
			<p class="text-center text-gray-600 mb-4">Here's what you chose:</p>
			<ul class="space-y-2 list-disc list-inside">
				{#each summary as item}
					<li>{item.choice}</li>
				{/each}
			</ul>
			<p class="text-center text-sm text-blue-600 mt-6">Proceeding to minting...</p>
		</div>
	{:else if currentQuestion}
		<div>
			<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{currentQuestion.title}</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Left Choice -->
				<button
					on:click={() => handleChoice('left')}
					class="relative p-8 rounded-lg text-white font-semibold text-xl transition-transform duration-300"
					class:transform={selectedSide}
					class:scale-105={selectedSide === 'left'}
					class:opacity-50={selectedSide && selectedSide !== 'left'}
					class:bg-red-500={!selectedSide}
					class:hover:bg-red-600={!selectedSide}
					class:bg-green-500={selectedSide === 'left'}
				>
					{currentQuestion.left}
					{#if selectedSide === 'left'}
						<div
							class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center"
						>
							<svg
								class="w-6 h-6 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
						</div>
					{/if}
				</button>

				<!-- Right Choice -->
				<button
					on:click={() => handleChoice('right')}
					class="relative p-8 rounded-lg text-white font-semibold text-xl transition-transform duration-300"
					class:transform={selectedSide}
					class:scale-105={selectedSide === 'right'}
					class:opacity-50={selectedSide && selectedSide !== 'right'}
					class:bg-blue-500={!selectedSide}
					class:hover:bg-blue-600={!selectedSide}
					class:bg-green-500={selectedSide === 'right'}
				>
					{currentQuestion.right}
					{#if selectedSide === 'right'}
						<div
							class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center"
						>
							<svg
								class="w-6 h-6 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path></svg
							>
						</div>
					{/if}
				</button>
			</div>
			<div class="mt-6 text-gray-500 font-medium">
				Round {roundsPlayed + 1} of {roundsTotal}
			</div>
		</div>
	{:else}
		<p>Loading game...</p>
	{/if}
</div>
