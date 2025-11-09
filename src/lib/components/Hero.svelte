<script lang="ts">
  import { showView, walletAddress, currentUser } from "$lib/stores";
  import { signOut } from "$lib/authService";
  import {
    connectWallet,
    disconnectWallet,
    formatAddress,
    isMetaMaskInstalled,
    isConnecting,
    connectionError,
  } from "$lib/web3";

  async function handleConnect() {
    await connectWallet();
  }

  function handleDisconnect() {
    disconnectWallet();
  }

  async function handleSignOut() {
    await signOut();
  }

  function handleBeginVerification() {
    if (!$walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    showView("tutorial");
  }
</script>

<div class="app-view space-y-6 text-center">
  <!-- User Info Bar -->
  {#if $currentUser}
    <div
      class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        {#if $currentUser.photoURL}
          <img
            src={$currentUser.photoURL}
            alt="Profile"
            class="w-10 h-10 rounded-full"
          />
        {/if}
        <div class="text-left">
          <p class="font-medium text-gray-800">{$currentUser.displayName}</p>
          <p class="text-xs text-gray-500">{$currentUser.email}</p>
        </div>
      </div>
      <button
        on:click={handleSignOut}
        class="text-sm text-red-600 hover:text-red-800 underline"
      >
        Sign Out
      </button>
    </div>
  {/if}

  <h1 class="text-4xl md:text-5xl font-extrabold text-blue-700">
    Prove Your Hygiene.
  </h1>
  <p class="text-xl md:text-2xl font-medium text-gray-700">
    Mint your <span class="font-bold">Proof-of-Lather</span> to the blockchain and
    certify your cleanliness.
  </p>
  <p class="text-gray-600 leading-relaxed">
    In a world of unverified claims, hygiene is the last frontier of truth. We
    are the <span class="font-bold">Groom Protocol</span>, decentralizing
    cleanliness for a better tomorrow. No more will you suffer the ambiguity of
    a colleague's personal habits.
  </p>

  <!-- Wallet Connection Section -->
  <div class="space-y-4">
    {#if !isMetaMaskInstalled()}
      <div
        class="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg"
      >
        <p class="font-medium">MetaMask Not Detected</p>
        <p class="text-sm">
          Please install <a
            href="https://metamask.io"
            target="_blank"
            class="underline font-bold">MetaMask</a
          > to use this app.
        </p>
      </div>
    {:else if !$walletAddress}
      <button
        on:click={handleConnect}
        disabled={$isConnecting}
        class="w-full bg-purple-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {$isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
      </button>
      {#if $connectionError}
        <p class="text-red-600 text-sm">{$connectionError}</p>
      {/if}
    {:else}
      <div
        class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg"
      >
        <p class="font-medium">✅ Wallet Connected</p>
        <p class="text-sm font-mono">{formatAddress($walletAddress)}</p>
        <button
          on:click={handleDisconnect}
          class="mt-2 text-xs underline hover:no-underline"
        >
          Disconnect
        </button>
      </div>
    {/if}
  </div>

  <button
    on:click={handleBeginVerification}
    disabled={!$walletAddress}
    class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Begin Verification
  </button>
  <p class="text-xs text-gray-500 pt-4">
    © 2025 Groom Protocol. Made at UWaterloo.<br />This is (probably) a joke.
  </p>
</div>
