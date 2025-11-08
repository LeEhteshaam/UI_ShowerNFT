<script lang="ts">
  import { showView, showerThought, walletAddress } from "$lib/stores";
  import { mintShowerNFT } from "$lib/web3";

  let thought = "";
  let isMinting = false;
  let errorMessage = "";

  async function mintNFT() {
    if (!$walletAddress) {
      errorMessage = "Please connect your wallet first!";
      return;
    }

    showerThought.set(thought);
    isMinting = true;
    errorMessage = "";

    // Show loading view immediately
    showView("loading");

    // Attempt to mint
    const result = await mintShowerNFT();

    if (result.success) {
      // Success! Store the transaction details
      // The Loading component will handle the transition to Complete
    } else {
      // Show error and go back
      errorMessage = result.error || "Failed to mint NFT";
      isMinting = false;
      showView("minting");
    }
  }
</script>

<div class="app-view space-y-6">
  <h2 class="text-3xl font-bold text-center">Verification Complete!</h2>
  <p class="text-gray-600">
    You are now eligible to mint your Certificate of Cleanliness. As an optional
    step, you may log your profound shower thought to the blockchain... forever.
  </p>

  <div>
    <label
      for="shower-thought"
      class="block text-sm font-medium text-gray-700 mb-1"
      >Log Your Shower Thought (Optional)</label
    >
    <input
      type="text"
      id="shower-thought"
      bind:value={thought}
      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      placeholder="e.g., 'Why is it called a building if it's already built?'"
    />
  </div>

  {#if errorMessage}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
    >
      <p class="font-medium">Error</p>
      <p class="text-sm">{errorMessage}</p>
    </div>
  {/if}

  <button
    on:click={mintNFT}
    disabled={isMinting || !$walletAddress}
    class="w-full bg-green-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isMinting ? "Minting..." : "Mint My Shower NFT"}
  </button>
</div>
