<script lang="ts">
    import { showView, showerThought } from '$lib/stores';

    let thought = '';

    function mintNFT() {
        showerThought.set(thought);
        showView('loading');
    }
</script>

<div class="app-view space-y-6">
    <h2 class="text-3xl font-bold text-center">Verification Complete!</h2>
    <p class="text-gray-600">You are now eligible to mint your Certificate of Cleanliness. As an optional step, you may log your profound shower thought to the blockchain... forever.</p>
    
    <div>
        <label for="shower-thought" class="block text-sm font-medium text-gray-700 mb-1">Log Your Shower Thought (Optional)</label>
        <input type="text" id="shower-thought" bind:value={thought} class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 'Why is it called a building if it's already built?'">
    </div>

    <button on:click={mintNFT} class="w-full bg-green-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
        Mint My Shower NFT
    </button>
</div>
