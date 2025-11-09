<script lang="ts">
    import { showView } from '$lib/stores';
    import { onMount } from 'svelte';

    const gameRounds = [
        ['LATHER', 'RINSE'],
        ['LATHER', 'RINSE', 'REPEAT'],
        ['REPEAT', 'LATHER', 'RINSE', 'REPEAT']
    ];
    const gameButtons = ['LATHER', 'RINSE', 'REPEAT'];

    let currentRound = 0;
    let playerInput: string[] = [];
    let sequenceDisplay = '...';
    let gameStatus = '';
    let gameStatusClass = 'text-blue-600';
    let buttonsDisabled = true;

    function showGameRound() {
        playerInput = [];
        const sequence = gameRounds[currentRound];
        gameStatus = `Round ${currentRound + 1} of ${gameRounds.length}`;
        gameStatusClass = 'text-blue-600';
        buttonsDisabled = true;
        sequenceDisplay = '...';
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < sequence.length) {
                sequenceDisplay = sequence[i];
                i++;
            } else {
                clearInterval(interval);
                sequenceDisplay = 'Your Turn!';
                buttonsDisabled = false;
            }
        }, 1000);
    }

    function gameInput(input: string) {
        if (buttonsDisabled) return;

        playerInput.push(input);
        const correctSequence = gameRounds[currentRound];
        
        if (playerInput[playerInput.length - 1] !== correctSequence[playerInput.length - 1]) {
            gameStatus = 'Incorrect Sequence! Resetting...';
            gameStatusClass = 'text-red-600 shake';
            buttonsDisabled = true;
            setTimeout(showGameRound, 2000);
        } else if (playerInput.length === correctSequence.length) {
            gameStatus = 'Round Complete!';
            buttonsDisabled = true;
            currentRound++;
            
            if (currentRound >= gameRounds.length) {
                gameStatus = 'Cognitive Challenge Passed!';
                setTimeout(() => showView('minting'), 2000);
            } else {
                setTimeout(showGameRound, 2000);
            }
        }
    }

    onMount(() => {
        showGameRound();
    });
</script>

<div class="app-view space-y-6 text-center">
    <h2 class="text-3xl font-bold">Step 3: Sequence Challenge</h2>
    <p class="text-gray-600">Your audio signature is confirmed. Please complete the Lather-Rinse-Repeat cognitive challenge to finalize your proof.</p>
    
    <div class="bg-gray-100 p-6 rounded-lg shadow-inner">
        <div class="mb-4">
            <div class="text-sm uppercase text-gray-500">Sequence</div>
            <div class="text-3xl font-bold h-10">{sequenceDisplay}</div>
        </div>
        <div class="h-6 mb-4 text-lg font-medium {gameStatusClass}">{gameStatus}</div>
    </div>

    <div class="grid grid-cols-3 gap-4">
        {#each gameButtons as button}
        <button on:click={() => gameInput(button)} disabled={buttonsDisabled} class="game-btn bg-blue-600 text-white font-bold text-lg py-12 rounded-lg shadow-lg hover:bg-blue-700">
            {button}
        </button>
        {/each}
    </div>
</div>
