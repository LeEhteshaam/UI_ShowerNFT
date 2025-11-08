<script lang="ts">
    import { showView } from '$lib/stores';
</script>

<div class="app-view space-y-6 text-center">
    <h1 class="text-4xl md:text-5xl font-extrabold text-blue-700">Prove Your Hygiene.</h1>
    <p class="text-xl md:text-2xl font-medium text-gray-700">Mint your <span class="font-bold">Proof-of-Lather</span> to the blockchain and certify your cleanliness.</p>
    <p class="text-gray-600 leading-relaxed">
        In a world of unverified claims, hygiene is the last frontier of truth. We are the <span class="font-bold">Groom Protocol</span>, decentralizing cleanliness for a better tomorrow. No more will you suffer the ambiguity of a colleague's personal habits.
    </p>
    <button on:click={() => showView('tutorial')} class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
        Begin Verification
    </button>
    <p class="text-xs text-gray-500 pt-4">© 2025 Groom Protocol. Made at UWaterloo.<br>This is (probably) a joke.</p>
</div>
