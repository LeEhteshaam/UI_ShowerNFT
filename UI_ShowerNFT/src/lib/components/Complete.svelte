<script lang="ts">
    import { showView, totalTime, showerThought } from '$lib/stores';

    function formatTime(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
</script>

<div class="app-view space-y-6 text-center">
    <h2 class="text-3xl font-bold text-green-600">Minting Successful!</h2>
    <p class="text-gray-600">Your Certificate of Cleanliness is now secured on the blockchain. You may now present this to colleagues, friends, and family as definitive proof of hygiene.</p>
    
    <div class="bg-blue-50 border-4 border-dashed border-blue-200 p-6 rounded-lg shadow-inner">
        <img src="https://placehold.co/600x400/000000/FFFFFF?text=CERTIFICATE+OF+CLEANLINESS" alt="A black certificate with white text reading 'Certificate of Cleanliness'. A placeholder image." class="w-full rounded-lg shadow-md mb-4" >
        
        <h3 class="text-xl font-bold text-left mb-2">NFT Metadata</h3>
        <div class="text-left space-y-1 text-sm">
            <p><strong>Token ID:</strong> <span class="font-mono text-gray-700">#00001</span></p>
            <p><strong>Verification:</strong> <span class="font-mono text-green-700 font-bold">Proof-of-Lather</span></p>
            <p><strong>Duration:</strong> <span class="font-mono text-gray-700">{formatTime($totalTime)}</span></p>
            <p><strong>Shower Thought:</strong> <span class="font-mono text-gray-700 italic">{$showerThought || "N/A (No profound thoughts recorded)"}</span></p>
        </div>
    </div>
    <button on:click={() => showView('hero')} class="w-full bg-gray-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
        Mint Another (Why?)
    </button>
</div>
