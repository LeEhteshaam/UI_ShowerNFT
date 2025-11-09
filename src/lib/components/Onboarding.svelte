<script lang="ts">
	import { saveFriendPhoneNumbers, saveWalletAddress } from '$lib/authService';
	import { showView, walletAddress } from '$lib/stores';
	import { connectWallet, isMetaMaskInstalled, formatAddress } from '$lib/web3';

	let phoneNumbers: string[] = [''];
	let isLoading = false;
	let errorMessage = '';
	let isConnectingWallet = false;

	function addPhoneField() {
		phoneNumbers = [...phoneNumbers, ''];
	}

	function removePhoneField(index: number) {
		phoneNumbers = phoneNumbers.filter((_, i) => i !== index);
	}

	function validatePhoneNumber(phone: string): boolean {
		// Basic validation - accepts formats like +1234567890 or 1234567890
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;
		return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
	}

	async function handleConnectWallet() {
		isConnectingWallet = true;
		await connectWallet();
		isConnectingWallet = false;
	}

	async function handleSubmit() {
		errorMessage = '';

		// Check if wallet is connected
		if (!$walletAddress) {
			errorMessage = 'Please connect your MetaMask wallet first';
			return;
		}

		// Filter out empty fields
		const validPhones = phoneNumbers
			.map((p) => p.trim())
			.filter((p) => p.length > 0);

		if (validPhones.length === 0) {
			errorMessage = "Please add at least one friend's phone number";
			return;
		}

		// Validate all phone numbers
		const invalidPhones = validPhones.filter((p) => !validatePhoneNumber(p));
		if (invalidPhones.length > 0) {
			errorMessage = 'Please enter valid phone numbers (e.g., +1234567890)';
			return;
		}

		isLoading = true;

		// Save wallet address to Firebase
		await saveWalletAddress($walletAddress);
		
		// Save friend phone numbers
		const result = await saveFriendPhoneNumbers(validPhones);

		if (result.success) {
			showView('dashboard'); // Go to dashboard instead of hero
		} else {
			errorMessage = result.error || 'Failed to save phone numbers';
			isLoading = false;
		}
	}

	async function handleSkip() {
		// Check if wallet is connected
		if (!$walletAddress) {
			errorMessage = 'Please connect your MetaMask wallet first';
			return;
		}

		// Save wallet address to Firebase
		await saveWalletAddress($walletAddress);
		
		// Save empty array and mark onboarding complete
		await saveFriendPhoneNumbers([]);
		showView('dashboard'); // Go to dashboard instead of hero
	}
</script>

<div class="app-view space-y-6">
	<div class="text-center space-y-2">
		<h2 class="text-3xl font-bold text-blue-700">Complete Your Setup</h2>
		<p class="text-gray-600">
			Connect your wallet and add friends to get started with ShowerNFT
		</p>
	</div>

	<!-- MetaMask Connection -->
	<div class="space-y-3">
		<h3 class="font-bold text-gray-800">Step 1: Connect MetaMask</h3>
		{#if !isMetaMaskInstalled()}
			<div class="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
				<p class="font-medium">MetaMask Not Detected</p>
				<p class="text-sm">
					Please install <a href="https://metamask.io" target="_blank" class="underline font-bold"
						>MetaMask</a
					> to use this app.
				</p>
			</div>
		{:else if !$walletAddress}
			<button
				on:click={handleConnectWallet}
				disabled={isConnectingWallet}
				class="w-full bg-orange-500 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-orange-600 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isConnectingWallet ? 'Connecting...' : '🦊 Connect MetaMask Wallet'}
			</button>
		{:else}
			<div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
				<p class="font-medium">✅ Wallet Connected</p>
				<p class="text-sm font-mono">{formatAddress($walletAddress)}</p>
			</div>
		{/if}
	</div>

	<!-- Friend Phone Numbers -->
	<div class="space-y-3">
		<h3 class="font-bold text-gray-800">Step 2: Add Friends (Optional)</h3>
		<div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
			<p class="text-sm text-gray-700">
				<strong>Social Accountability:</strong> When your Proof-of-Lather NFT expires, your friends
				will get an SMS notification. Keep them updated on your hygiene status! 🚿📱
			</p>
		</div>

		<div class="space-y-4">
			{#each phoneNumbers as phone, index}
			<div class="flex gap-2">
				<input
					type="tel"
					bind:value={phoneNumbers[index]}
					placeholder="+1234567890"
					class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
				/>
				{#if phoneNumbers.length > 1}
					<button
						on:click={() => removePhoneField(index)}
						class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
						title="Remove"
					>
						✕
					</button>
				{/if}
			</div>
		{/each}

		<button
			on:click={addPhoneField}
			class="w-full border-2 border-dashed border-gray-300 text-gray-600 font-medium py-3 rounded-lg hover:border-blue-400 hover:text-blue-600 transition"
		>
			+ Add Another Friend
		</button>
	</div>
	</div>

	{#if errorMessage}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
			<p class="text-sm">{errorMessage}</p>
		</div>
	{/if}

	<div class="space-y-2">
		<button
			on:click={handleSubmit}
			disabled={isLoading}
			class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? 'Saving...' : 'Continue to App'}
		</button>

		<button
			on:click={handleSkip}
			class="w-full text-sm text-gray-600 hover:text-gray-800 underline py-2"
		>
			Skip for now (you can add friends later)
		</button>
	</div>

	<div class="text-xs text-gray-500 text-center">
		<p>We use Twilio to send SMS notifications. Standard messaging rates may apply.</p>
	</div>
</div>
