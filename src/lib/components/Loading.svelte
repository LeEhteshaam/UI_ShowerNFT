<script lang="ts">
    import { showView } from '$lib/stores';
    import { onMount } from 'svelte';

    onMount(() => {
        setTimeout(() => {
            showView('complete');
        }, 3000);
    });
</script>

<div class="app-view space-y-6 text-center">
    <h2 class="text-3xl font-bold text-blue-700">Minting in Progress...</h2>
    <p class="text-gray-600">Contacting the blockchain... Verifying your Proof-of-Lather... Polishing your NFT...</p>
    <div class="flex justify-center items-center p-12">
        <div class="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
    </div>
</div>
