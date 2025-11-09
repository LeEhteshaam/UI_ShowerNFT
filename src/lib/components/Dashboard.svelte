<script lang="ts">
  import {
    showView,
    currentUser,
    walletAddress,
    latestNFTData,
    isLoadingNFTData,
    tutorialCompleted,
    nextPollIn,
    friendsPhoneNumbers,
  } from "$lib/stores";
  import { signOut, deleteExpiredNFT, getLatestNFT, sendExpiryNotifications } from "$lib/authService";
  import { connectWallet, formatAddress } from "$lib/web3";
  import { onMount, onDestroy } from "svelte";

  // Countdown state
  let timeRemaining = 0; // Will be calculated from NFT data
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let countdownInterval: number;
  let expiryCheckInterval: number;
  let pollCountdownInterval: number;

  // Check for expired NFTs and delete them (every 10 seconds)
  async function checkExpiredNFTs() {
    // Reset poll countdown
    nextPollIn.set(10);

    if (!$currentUser || !$latestNFTData) return;

    // Check if NFT has expired locally first
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const isExpired = now >= $latestNFTData.expiresAt;

    if (isExpired && $latestNFTData.isValid) {
      console.log("🔔 NFT expired! Deleting and notifying friends...");

      // Send SMS notifications to friends
      if ($friendsPhoneNumbers && $friendsPhoneNumbers.length > 0) {
        const userName = $currentUser.displayName || 'A CS student';
        console.log(`📱 Sending SMS to ${$friendsPhoneNumbers.length} friends...`);
        const smsResult = await sendExpiryNotifications(userName, $friendsPhoneNumbers);
        
        if (smsResult.success) {
          console.log(`✅ SMS sent to ${smsResult.sent} friends`);
        } else {
          console.error('❌ Failed to send SMS:', smsResult.error);
        }
      }

      // Delete from Firebase (Firestore + Storage)
      const deleteResult = await deleteExpiredNFT($latestNFTData.imageUrl);
      
      if (deleteResult.success) {
        // Clear local store
        latestNFTData.set(null);
        console.log("✅ Expired NFT deleted successfully");
      } else {
        console.error("❌ Failed to delete expired NFT:", deleteResult.error);
      }
    }
  }

  // Update countdown display
  function updateCountdown() {
    if (!$latestNFTData) {
      timeRemaining = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
      return;
    }

    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const remaining = $latestNFTData.expiresAt - now;

    if (remaining > 0) {
      timeRemaining = remaining;
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
    // Skip tutorial if already completed - go straight to verification
    if ($tutorialCompleted) {
      showView("verification");
    } else {
      showView("tutorial");
    }
  }

  onMount(async () => {
    // Load NFT data from Firebase (NOT blockchain!)
    if ($currentUser) {
      console.log("📊 Loading NFT data from Firebase...");
      isLoadingNFTData.set(true);
      const result = await getLatestNFT();
      
      if (result.success && result.latestNFT) {
        // Convert Firebase record to LatestNFTData format
        const nftRecord = result.latestNFT;
        latestNFTData.set({
          tokenId: nftRecord.tokenId,
          expiresAt: nftRecord.expiresAt,
          mintTime: nftRecord.mintTime,
          showerThought: nftRecord.showerThought,
          imageUrl: nftRecord.imageUrl,
          customTimeout: nftRecord.customTimeout || 0,
          isValid: true // We'll check expiry separately
        });
        console.log("✅ Loaded NFT from Firebase:", nftRecord);
      } else {
        latestNFTData.set(null);
        console.log("ℹ️ No NFT found in Firebase");
      }
      isLoadingNFTData.set(false);
    }

    // Start countdown (updates every second)
    countdownInterval = setInterval(
      updateCountdown,
      1000
    ) as unknown as number;

    // Check for expired NFTs every 10 seconds
    checkExpiredNFTs();
    expiryCheckInterval = setInterval(
      checkExpiredNFTs,
      10 * 1000
    ) as unknown as number;

    // Poll countdown timer (updates every second)
    pollCountdownInterval = setInterval(() => {
      nextPollIn.update(n => Math.max(0, n - 1));
    }, 1000) as unknown as number;

    // Initial countdown update
    updateCountdown();
  });

  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    if (expiryCheckInterval) {
      clearInterval(expiryCheckInterval);
    }
    if (pollCountdownInterval) {
      clearInterval(pollCountdownInterval);
    }
  });

  // Format numbers with leading zeros
  const pad = (num: number) => String(num).padStart(2, "0");

  // Determine status
  $: isExpired = timeRemaining === 0 && $latestNFTData !== null;
  $: hasNFT = $latestNFTData !== null;
  $: statusColor = isExpired ? "text-red-600" : hasNFT ? "text-green-600" : "text-gray-500";
  $: statusText = isExpired ? "STINKY! 🤢" : hasNFT ? "FRESH! ✨" : "NO NFT";
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
    {#if $isLoadingNFTData}
      <p class="text-sm text-gray-500 mt-2">🔮 Loading NFT data...</p>
    {/if}
  </div>

  <!-- NFT Image (if available) -->
  {#if $latestNFTData && $latestNFTData.imageUrl}
    <div class="flex justify-center">
      <div class="relative max-w-sm rounded-lg overflow-hidden shadow-lg border-4 border-blue-500">
        <img
          src={$latestNFTData.imageUrl}
          alt="Shower Selfie NFT"
          class="w-full h-auto"
        />
        <div
          class="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
        >
          #{$latestNFTData.tokenId}
        </div>
        {#if $latestNFTData.showerThought}
          <div class="bg-black bg-opacity-75 text-white p-3 text-sm">
            💭 "{$latestNFTData.showerThought}"
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Countdown Timer -->
  {#if hasNFT}
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
  {:else}
    <div
      class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg text-center"
    >
      <p class="font-bold">🚿 No Active NFT</p>
      <p class="text-sm">
        Start your first shower verification to prove your hygiene!
      </p>
    </div>
  {/if}  <!-- Freshen Up Button -->
  <div class="pt-4 space-y-3">
    <button
      on:click={startShowerVerification}
      class="w-full bg-linear-to-r from-blue-500 to-blue-700 text-white font-bold text-xl py-6 px-8 rounded-lg shadow-xl hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0"
    >
      🚿 Freshen Up
    </button>
    <p class="text-xs text-gray-500 text-center mt-2">
      Start a new shower verification to mint a fresh NFT
    </p>

    <!-- Browse Users Button -->
    <button
      on:click={() => showView("browseusers")}
      class="w-full bg-purple-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0"
    >
      👥 Browse Community
    </button>
    <p class="text-xs text-gray-500 text-center">
      Check if your friends are fresh or stinky
    </p>
  </div>

  <!-- Stats/Info Section -->
  <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-600">{hasNFT && !isExpired ? 1 : 0}</div>
      <div class="text-sm text-gray-600">Active NFTs</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-600">
        {$latestNFTData ? `#${$latestNFTData.tokenId}` : "-"}
      </div>
      <div class="text-sm text-gray-600">Token ID</div>
    </div>
  </div>

  <!-- Info Footer -->
  <div class="text-xs text-gray-500 text-center pt-4 border-t border-gray-200 space-y-2">
    <p>The Groom Protocol • Decentralizing Hygiene Since 2025</p>
    
    <!-- Debug: Next Poll Timer -->
    <div class="bg-gray-100 rounded px-3 py-2 inline-block">
      <span class="font-mono text-gray-700">
        🔍 Next expiry check in: <span class="font-bold">{$nextPollIn}s</span>
      </span>
    </div>
  </div>
</div>
