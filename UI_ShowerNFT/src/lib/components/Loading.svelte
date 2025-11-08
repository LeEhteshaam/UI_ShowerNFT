<script lang="ts">
  import { showView } from "$lib/stores";
  import { onMount } from "svelte";

  // For demo purposes, we'll still auto-redirect after a delay
  // In production, this would wait for actual transaction confirmation
  onMount(() => {
    setTimeout(() => {
      showView("complete");
    }, 5000); // Increased to 5 seconds to simulate blockchain transaction time
  });
</script>

<div class="app-view space-y-6 text-center">
  <h2 class="text-3xl font-bold text-blue-700">Minting in Progress...</h2>
  <p class="text-gray-600">
    Contacting the blockchain... Verifying your Proof-of-Lather... Polishing
    your NFT...
  </p>
  <p class="text-sm text-gray-500">
    Please confirm the transaction in MetaMask and wait for it to be mined on
    Base Sepolia.
  </p>
  <div class="flex justify-center items-center p-12">
    <div
      class="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"
    ></div>
  </div>
  <p class="text-xs text-gray-400">This may take 10-30 seconds...</p>
</div>
