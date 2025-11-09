<script lang="ts">
    import { showView } from '$lib/stores';
    import { onMount } from 'svelte';

    // --- State ---
    let tiles: { id: number; url: string; isCorrect: boolean; selected: boolean }[] = [];
    let statusText = '';
    let statusClass = 'text-gray-600';
    const maxTiles = 9; // 3x3 grid

    // --- Image Data (from your static/images folder) ---
    const allImageFiles = [
        'not1.jpeg', 'not2.jpg', 'not3.jpg', 'not4.jpg', 'not5.jpg', 'not5.webp', 'not6.avif', 'not7.jpg', 'shamp.avif', 'shampoo1.jpeg', 'shampoo10.jpg', 'shampoo11.webp', 'shampoo12.webp', 'shampoo13.avif', 'shampoo14.webp', 'shampoo15.jpg', 'shampoo16.jpg', 'shampoo17.jpeg', 'shampoo18.webp', 'shampoo19.jpg', 'shampoo2.jpg', 'shampoo20.avif', 'shampoo23.webp', 'shampoo24.webp', 'shampoo25.jpg', 'shampoo26.jpg', 'shampoo26.webp', 'shampoo3.jpg', 'shampoo4.jpg', 'shampoo5.jpeg', 'shampoo6.jpeg', 'shampoo7.jpeg', 'shampoo8.jpg', 'shampoo9.avif'
    ];

    // --- Lifecycle ---
    onMount(() => {
        setupGame();
    });

    // --- Game Logic ---
    function setupGame() {
        // Reset state
        statusText = '';
        statusClass = 'text-gray-600';

        // Shuffle and select images
        const shuffled = [...allImageFiles].sort(() => 0.5 - Math.random());
        const selectedImages = shuffled.slice(0, maxTiles);

        // Create tile objects
        tiles = selectedImages.map((filename, index) => ({
            id: index,
            url: `/images/${filename}`,
            isCorrect: filename.toLowerCase().startsWith('shampoo'), // Explicitly check if the name starts with 'shampoo'
            selected: false
        }));
    }

    function handleTileClick(clickedTile: typeof tiles[0]) {
        // Toggle selection
        tiles = tiles.map(tile => 
            tile.id === clickedTile.id ? { ...tile, selected: !tile.selected } : tile
        );
    }

    function verifySelection() {
        const selectedCorrect = tiles.filter(t => t.selected && t.isCorrect).length;
        const selectedIncorrect = tiles.filter(t => t.selected && !t.isCorrect).length;
        const totalCorrect = tiles.filter(t => t.isCorrect).length;

        if (selectedIncorrect === 0 && selectedCorrect === totalCorrect) {
            statusText = 'Correct! Well done!';
            statusClass = 'text-green-600';
            setTimeout(() => {
                showView('minting');
            }, 500); // Reduced delay
        } else {
            statusText = 'Incorrect. Please try again.';
            statusClass = 'text-red-600 shake';
            // Reset selection after a delay
            setTimeout(() => {
                tiles = tiles.map(t => ({ ...t, selected: false }));
                statusText = '';
            }, 2000);
        }
    }

    function handleSkip() {
        const totalCorrect = tiles.filter(t => t.isCorrect).length;
        if (totalCorrect === 0) {
            statusText = 'Correct! There were no shampoo bottles.';
            statusClass = 'text-green-600';
            setTimeout(() => {
                showView('minting');
            }, 500); // Reduced delay
        } else {
            statusText = 'Incorrect. There are shampoo bottles to select.';
            statusClass = 'text-red-600 shake';
        }
    }
</script>

<div class="app-view space-y-6 text-center">
    <div class="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h2 class="text-lg font-semibold">Select all squares with</h2>
        <h1 class="text-3xl font-bold">Shampoo bottles</h1>
        <p class="text-sm opacity-80 mt-2">If there are none, click Verify.</p>
    </div>

    <div class="grid grid-cols-3 gap-1 p-1 bg-gray-300 rounded-lg">
        {#each tiles as tile (tile.id)}
            <div
                on:click={() => handleTileClick(tile)}
                class="aspect-square bg-cover bg-center cursor-pointer relative rounded-md"
                class:ring-4={tile.selected}
                class:ring-blue-500={tile.selected}
                style="background-image: url('{tile.url}')"
            >
                {#if tile.selected}
                    <div class="absolute inset-0 bg-blue-500 bg-opacity-40 flex items-center justify-center">
                        <svg class="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    {#if statusText}
        <div class="h-6 text-lg font-medium {statusClass}">{statusText}</div>
    {/if}

    <div class="flex items-center justify-between gap-4">
        <button on:click={setupGame} class="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>
        </button>
        <button on:click={verifySelection} class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700">
            Verify
        </button>
    </div>
</div>
