<script lang="ts">
  import {
    showView,
    totalTime,
    showerThought,
    walletAddress,
    mintTxHash,
  } from "$lib/stores";
  import { formatAddress, CONTRACT_ADDRESS } from "$lib/web3";
  import { get } from "svelte/store";

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  function viewOnBaseScan() {
    if ($mintTxHash) {
      window.open(`https://sepolia.basescan.org/tx/${$mintTxHash}`, "_blank");
    }
  }

  function viewContractOnBaseScan() {
    const contractAddr = get(CONTRACT_ADDRESS);
    window.open(
      `https://sepolia.basescan.org/address/${contractAddr}`,
      "_blank"
    );
  }
</script>

<div class="app-view space-y-6 text-center">
  <h2 class="text-3xl font-bold text-green-600">Minting Successful!</h2>
  <p class="text-gray-600">
    Your Certificate of Cleanliness is now secured on the blockchain. You may
    now present this to colleagues, friends, and family as definitive proof of
    hygiene.
  </p>

  <div
    class="bg-blue-50 border-4 border-dashed border-blue-200 p-6 rounded-lg shadow-inner"
  >
    <img
      src="https://placehold.co/600x400/000000/FFFFFF?text=CERTIFICATE+OF+CLEANLINESS"
      alt="Certificate of Cleanliness"
      class="w-full rounded-lg shadow-md mb-4"
    />

    <h3 class="text-xl font-bold text-left mb-2">NFT Metadata</h3>
    <div class="text-left space-y-1 text-sm">
      <p>
        <strong>Token ID:</strong>
        <span class="font-mono text-gray-700">#00001</span>
      </p>
      <p>
        <strong>Verification:</strong>
        <span class="font-mono text-green-700 font-bold">Proof-of-Lather</span>
      </p>
      <p>
        <strong>Duration:</strong>
        <span class="font-mono text-gray-700">{formatTime($totalTime)}</span>
      </p>
      <p>
        <strong>Shower Thought:</strong>
        <span class="font-mono text-gray-700 italic"
          >{$showerThought || "N/A (No profound thoughts recorded)"}</span
        >
      </p>
      <p>
        <strong>Minted By:</strong>
        <span class="font-mono text-gray-700"
          >{formatAddress($walletAddress || "")}</span
        >
      </p>
      {#if $mintTxHash}
        <p>
          <strong>Transaction:</strong>
          <button
            on:click={viewOnBaseScan}
            class="font-mono text-blue-600 hover:underline text-xs"
          >
            View on BaseScan →
          </button>
        </p>
      {/if}
    </div>

    <!-- NFT Viewer Links -->
    <div class="mt-4 pt-4 border-t border-blue-300 space-y-2">
      <p class="text-xs font-semibold text-gray-600 mb-2">View Your NFT:</p>
      <div class="flex flex-col gap-2">
        <button
          on:click={viewContractOnBaseScan}
          class="bg-gray-700 text-white text-xs font-medium py-2 px-4 rounded hover:bg-gray-800 transition"
        >
          📜 View Contract on BaseScan
        </button>
      </div>
    </div>
  </div>
  <button
    on:click={() => showView("hero")}
    class="w-full bg-gray-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
  >
    Mint Another (Why?)
  </button>
</div>
