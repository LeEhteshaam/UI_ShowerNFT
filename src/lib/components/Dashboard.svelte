<script lang="ts">
  import { showView, currentUser, walletAddress } from "$lib/stores";
  import { signOut } from "$lib/authService";
  import { connectWallet, formatAddress, isMetaMaskInstalled } from "$lib/web3";
  import { onMount, onDestroy } from "svelte";

  // Countdown state (24 hours from now for demo)
  let timeRemaining = 24 * 60 * 60; // 24 hours in seconds
  let hours = 24;
  let minutes = 0;
  let seconds = 0;
  let countdownInterval: number;

  // Update countdown display
  function updateCountdown() {
    if (timeRemaining > 0) {
      timeRemaining--;
      hours = Math.floor(timeRemaining / 3600);
      minutes = Math.floor((timeRemaining % 3600) / 60);
      seconds = timeRemaining % 60;
    } else {
      // Expired!
      timeRemaining = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  function startShowerVerification() {
    showView("tutorial");
  }

  onMount(() => {
    // Start countdown
    countdownInterval = setInterval(updateCountdown, 1000) as unknown as number;
  });

  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });

  // Format numbers with leading zeros
  const pad = (num: number) => String(num).padStart(2, "0");

  // Determine status
  $: isExpired = timeRemaining === 0;
  $: statusColor = isExpired ? "text-red-600" : "text-green-600";
  $: statusText = isExpired ? "STINKY! 🤢" : "FRESH! ✨";
</script>

<div class="app-view space-y-6">
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
          {#if $walletAddress}
            <p class="text-xs text-gray-500 font-mono">
              {formatAddress($walletAddress)}
            </p>
          {/if}
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

  <!-- Status Badge -->
  <div class="text-center">
    <h2 class="text-2xl font-bold {statusColor}">
      {statusText}
    </h2>
  </div>

  <!-- Countdown Timer -->
  <div class="text-center space-y-4">
    <h3 class="text-lg font-medium text-gray-700">Time Until NFT Expires</h3>

    <div class="flex justify-center gap-4">
      <!-- Hours -->
      <div
        class="bg-blue-600 text-white rounded-lg p-6 shadow-lg min-w-[100px]"
      >
        <div class="text-5xl font-bold font-mono">{pad(hours)}</div>
        <div class="text-sm uppercase mt-2">Hours</div>
      </div>

      <!-- Minutes -->
      <div
        class="bg-blue-600 text-white rounded-lg p-6 shadow-lg min-w-[100px]"
      >
        <div class="text-5xl font-bold font-mono">{pad(minutes)}</div>
        <div class="text-sm uppercase mt-2">Minutes</div>
      </div>

      <!-- Seconds -->
      <div
        class="bg-blue-600 text-white rounded-lg p-6 shadow-lg min-w-[100px]"
      >
        <div class="text-5xl font-bold font-mono">{pad(seconds)}</div>
        <div class="text-sm uppercase mt-2">Seconds</div>
      </div>
    </div>

    {#if isExpired}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
      >
        <p class="font-bold">⚠️ Your Proof-of-Lather has expired!</p>
        <p class="text-sm">
          You're officially stinky. Your friends have been notified. 📱
        </p>
      </div>
    {:else}
      <div
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
      >
        <p class="font-medium">✅ Your hygiene is verified!</p>
        <p class="text-sm">Stay fresh, CS student. Your NFT is valid.</p>
      </div>
    {/if}
  </div>

  <!-- Freshen Up Button -->
  <div class="pt-4">
    <button
      on:click={startShowerVerification}
      class="w-full bg-linear-to-r from-blue-500 to-blue-700 text-white font-bold text-xl py-6 px-8 rounded-lg shadow-xl hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0"
    >
      🚿 Freshen Up
    </button>
    <p class="text-xs text-gray-500 text-center mt-2">
      Start a new shower verification to mint a fresh NFT
    </p>
  </div>

  <!-- Stats/Info Section -->
  <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-600">1</div>
      <div class="text-sm text-gray-600">Active NFTs</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-600">0</div>
      <div class="text-sm text-gray-600">Day Streak</div>
    </div>
  </div>

  <!-- Info Footer -->
  <div class="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
    <p>The Groom Protocol • Decentralizing Hygiene Since 2025</p>
  </div>
</div>
