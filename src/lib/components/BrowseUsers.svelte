<script lang="ts">
  import { showView, currentUser } from "$lib/stores";
  import { getAllUsers } from "$lib/authService";
  import { formatAddress } from "$lib/web3";
  import { onMount } from "svelte";

  type UserCard = {
    uid: string;
    displayName: string;
    photoURL?: string;
    walletAddress?: string;
    latestNFT?: {
      tokenId: number;
      expiresAt: number;
      mintTime: number;
      showerThought: string;
      imageUrl: string;
      txHash: string;
      isActive: boolean;
    };
  };

  let users: UserCard[] = [];
  let isLoading = true;
  let errorMessage = "";
  let currentTime = Math.floor(Date.now() / 1000);

  // Update current time every second for live countdown
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    loadUsers();
    
    // Update time every second - force reactivity with assignment
    interval = setInterval(() => {
      currentTime = Math.floor(Date.now() / 1000);
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  });

  async function loadUsers() {
    isLoading = true;
    errorMessage = "";

    const result = await getAllUsers();

    if (result.success && result.users) {
      // Filter out current user - cast to any to avoid TypeScript issues
      users = (result.users as any[]).filter((u: any) => u.uid !== $currentUser?.uid);
      console.log(`✅ Loaded ${users.length} users`);
    } else {
      errorMessage = result.error || "Failed to load users";
    }

    isLoading = false;
  }

  function getUserStatus(user: UserCard, now: number): {
    isValid: boolean;
    timeRemaining: number;
    hours: number;
    minutes: number;
    seconds: number;
    statusText: string;
    statusColor: string;
  } {
    if (!user.latestNFT || !user.latestNFT.isActive) {
      return {
        isValid: false,
        timeRemaining: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        statusText: "STINKY! 🤢",
        statusColor: "text-red-600",
      };
    }

    const remaining = user.latestNFT.expiresAt - now;

    if (remaining <= 0) {
      return {
        isValid: false,
        timeRemaining: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        statusText: "STINKY! 🤢",
        statusColor: "text-red-600",
      };
    }

    return {
      isValid: true,
      timeRemaining: remaining,
      hours: Math.floor(remaining / 3600),
      minutes: Math.floor((remaining % 3600) / 60),
      seconds: remaining % 60,
      statusText: "FRESH! ✨",
      statusColor: "text-green-600",
    };
  }

  function viewOnBaseScan(txHash: string) {
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank");
  }

  const pad = (num: number) => String(num).padStart(2, "0");
</script>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="text-4xl font-bold text-blue-700">👥 Community Hygiene Status</h2>
      <p class="text-gray-600 text-lg">
        Check if your fellow CS students are fresh or stinky!
      </p>
    </div>

    <!-- Back Button -->
    <button
      on:click={() => showView("dashboard")}
      class="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition shadow-md"
    >
      ← Back to Dashboard
    </button>

    <!-- Loading State -->
    {#if isLoading}
      <div class="text-center py-12">
        <p class="text-gray-500 text-xl">🔍 Loading users...</p>
      </div>
    {:else if errorMessage}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
      >
        <p class="font-medium">❌ Error</p>
        <p class="text-sm">{errorMessage}</p>
      </div>
    {:else if users.length === 0}
      <div
        class="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-8 rounded-lg text-center"
      >
        <p class="font-bold text-xl">🚿 You're the First One!</p>
        <p class="text-sm mt-2">
          No other users have joined the Groom Protocol yet. Tell your friends!
        </p>
      </div>
    {:else}
      <!-- User Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each users as user (user.uid)}
          {@const status = getUserStatus(user, currentTime)}
          <div
            class="bg-white border-4 rounded-lg shadow-lg p-6 space-y-4 relative transform transition hover:scale-105"
            class:border-green-500={status.isValid}
            class:border-red-500={!status.isValid}
          >
            <!-- Sticky/Badge -->
            {#if !status.isValid}
              <div
                class="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 animate-pulse"
              >
                STINKY! 🤢
              </div>
            {:else}
              <div
                class="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12"
              >
                FRESH! ✨
              </div>
            {/if}

            <!-- User Info -->
            <div class="flex items-center gap-3">
              {#if user.photoURL}
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  class="w-12 h-12 rounded-full border-2 border-gray-300"
                />
              {:else}
                <div
                  class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl"
                >
                  {user.displayName?.charAt(0).toUpperCase() || "?"}
                </div>
              {/if}
              <div class="flex-1">
                <p class="font-bold text-gray-800 text-lg">{user.displayName || "Anonymous"}</p>
                {#if user.walletAddress}
                  <p class="text-xs text-gray-500 font-mono">
                    {formatAddress(user.walletAddress)}
                  </p>
                {/if}
              </div>
            </div>

            <!-- Status Badge -->
            <div class="text-center py-2">
              <span class="text-2xl font-bold {status.statusColor}">
                {status.statusText}
              </span>
            </div>

            <!-- NFT Image or Placeholder -->
            {#if user.latestNFT && user.latestNFT.imageUrl && status.isValid}
              <div class="relative">
                <img
                  src={user.latestNFT.imageUrl}
                  alt="Shower Selfie"
                  class="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <div
                  class="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold"
                >
                  NFT #{user.latestNFT.tokenId}
                </div>
              </div>
            {:else}
              <div
                class="w-full h-48 bg-gray-200 rounded-lg shadow-md flex items-center justify-center"
              >
                <p class="text-gray-500 text-6xl">😷</p>
              </div>
            {/if}

            <!-- Shower Thought -->
            {#if user.latestNFT && user.latestNFT.showerThought && status.isValid}
              <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p class="text-sm text-gray-700 italic">
                  💭 "{user.latestNFT.showerThought}"
                </p>
              </div>
            {:else}
              <div class="bg-gray-100 border-l-4 border-gray-400 p-3 rounded">
                <p class="text-sm text-gray-500 italic">
                  💭 No profound thoughts recorded...
                </p>
              </div>
            {/if}

            <!-- Countdown Timer or Expired Message -->
            {#if status.isValid}
              <div class="text-center space-y-2">
                <p class="text-xs font-medium text-gray-600">Time Until Stinky:</p>
                <div class="flex justify-center gap-2">
                  <div class="bg-blue-600 text-white rounded px-3 py-2 min-w-[60px]">
                    <div class="text-2xl font-bold font-mono">{pad(status.hours)}</div>
                    <div class="text-xs uppercase">hrs</div>
                  </div>
                  <div class="bg-blue-600 text-white rounded px-3 py-2 min-w-[60px]">
                    <div class="text-2xl font-bold font-mono">{pad(status.minutes)}</div>
                    <div class="text-xs uppercase">min</div>
                  </div>
                  <div class="bg-blue-600 text-white rounded px-3 py-2 min-w-[60px]">
                    <div class="text-2xl font-bold font-mono">{pad(status.seconds)}</div>
                    <div class="text-xs uppercase">sec</div>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center"
              >
                <p class="font-bold">❌ No Valid NFT</p>
                <p class="text-xs">This user needs to shower!</p>
              </div>
            {/if}

            <!-- BaseScan Link -->
            {#if user.latestNFT && user.latestNFT.txHash}
              <button
                on:click={() => viewOnBaseScan(user.latestNFT?.txHash || '')}
                class="w-full bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-800 transition"
              >
                📜 View on BaseScan →
              </button>
            {:else}
              <button
                disabled
                class="w-full bg-gray-300 text-gray-500 text-sm font-medium py-2 px-4 rounded cursor-not-allowed"
              >
                📜 No Transaction Available
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Refresh Button -->
    <button
      on:click={loadUsers}
      disabled={isLoading}
      class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
    >
      {isLoading ? "🔄 Loading..." : "🔄 Refresh Users"}
    </button>
  </div>
</div>
