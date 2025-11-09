<script lang="ts">
    import { onMount } from 'svelte';
    import SequenceGame from './SequenceGame.svelte';
    import Captcha from './Captcha.svelte';
    import WouldYouRather from './WouldYouRather.svelte';

    let selectedGame: any = null; // Initialize as null

    onMount(() => {
        // All logic moved into onMount to ensure it only runs on the client
        const games = [SequenceGame, Captcha, WouldYouRather];
        const randomIndex = Math.floor(Math.random() * games.length);
        selectedGame = games[randomIndex];
    });
</script>

<div class="app-view space-y-6 text-center">
    {#if selectedGame}
        <svelte:component this={selectedGame} />
    {:else}
        <!-- Optional: show a loading state to prevent layout shift -->
        <p>Loading a random challenge...</p>
    {/if}
</div>
