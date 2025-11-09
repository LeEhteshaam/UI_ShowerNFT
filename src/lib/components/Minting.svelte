<script lang="ts">
    import { showView, showerThought } from '$lib/stores';

    let thought = '';
    let bodyWash = '';
    let usedShampoo = '';
    let waterTemperature = '';

    function mintNFT() {
        // You can now use bodyWash, usedShampoo, and waterTemperature when minting
        showerThought.set(thought);
        showView('loading');

        setTimeout(() => {
            showView('complete'); // Should go to complete, not back to minting
        }, 2000); // Increased delay to simulate minting
    }
</script>

<div class="app-view space-y-6">
    <h2 class="text-3xl font-bold text-center">Verification Complete!</h2>
    <p class="text-gray-600">You are now eligible to mint your Certificate of Cleanliness. Please fill out the details below.</p>

    <div class="space-y-4">
        <!-- Body Wash -->
        <div>
            <label for="body-wash" class="block text-sm font-medium text-gray-700 mb-1">What body wash did you use?</label>
            <input type="text" id="body-wash" bind:value={bodyWash} class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Old Spice">
        </div>

        <!-- Used Shampoo -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Did you use shampoo today?</label>
            <div class="flex items-center gap-6">
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="shampoo" value="yes" bind:group={usedShampoo} class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                    <span class="ml-2 text-gray-700">Yes</span>
                </label>
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="shampoo" value="no" bind:group={usedShampoo} class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                    <span class="ml-2 text-gray-700">No</span>
                </label>
            </div>
        </div>

        <!-- Water Temperature -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Hot or cold water?</label>
            <div class="flex items-center gap-6">
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="water" value="hot" bind:group={waterTemperature} class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                    <span class="ml-2 text-gray-700">Hot</span>
                </label>
                <label class="flex items-center cursor-pointer">
                    <input type="radio" name="water" value="cold" bind:group={waterTemperature} class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                    <span class="ml-2 text-gray-700">Cold</span>
                </label>
            </div>
        </div>

        <!-- Shower Thought -->
        <div>
            <label for="shower-thought" class="block text-sm font-medium text-gray-700 mb-1">Log Your Shower Thought (Optional)</label>
            <input type="text" id="shower-thought" bind:value={thought} class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 'Why is it called a building if it's already built?'">
        </div>
    </div>

    <button on:click={mintNFT} class="w-full bg-green-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
        Mint My Shower NFT
    </button>
</div>
