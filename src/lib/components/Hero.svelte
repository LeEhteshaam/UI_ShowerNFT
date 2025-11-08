<script lang="ts">
    import { showView } from '$lib/stores';
</script>

<div class="app-view space-y-8 text-center">
    <h1 class="text-5xl md:text-6xl font-extrabold text-blue-700">Prove Your Hygiene.</h1>
    <p class="text-2xl md:text-3xl font-semibold text-gray-700">Mint your <span class="font-bold">Proof-of-Lather</span> to the blockchain and certify your cleanliness.</p>
    <p class="text-lg text-gray-600 leading-relaxed">
        In a world chracterized by <span class="font-bold"> smelly CS students</span>, hygiene is the last frontier of truth. We are the <span class="font-bold">Groom Protocol</span>, combatting one smelly person at a time.
    </p>
    <button on:click={() => showView('tutorial')} class="w-full bg-blue-600 text-white font-bold text-xl py-5 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
        Begin Verification
    </button>
    <p class="text-sm text-gray-500 pt-4">© 2025 Groom Protocol. Made at UWaterloo by Hygenic, jacked, cracked and attractive UWaterloo CS Students.<br></p>
</div>
