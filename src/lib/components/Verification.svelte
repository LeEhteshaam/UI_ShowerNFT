<script lang="ts">
    import { showView, totalTime } from '$lib/stores';
    import { onMount, onDestroy } from 'svelte';

    let verificationStarted = false;
    let running = false;
    let elapsed = 0; // cumulative seconds of detected showering
    let display = '0:00';
    let volumePercent = 0;
    let statusMessage = 'Ready to verify...';
    let statusClass = 'text-gray-600';

    const VOLUME_THRESHOLD = 25; // Increased from 10 to better filter background noise
    let requiredSeconds = 300; // default 5 minutes
    let isAudioDetected = false;
    let lowVolumeSince: number | null = null;
    let errorAudioPlayed = false;
    let timerStarted = false; // Track if the timer has been started by audio detection

    let audioPlayer: HTMLAudioElement;
    const errorT1Audios = [
        '/audio/DrakeErrorT1.mp4',
        '/audio/ArnoldErrorT1.mp4',
        '/audio/RickErrorT1.mp4',
        '/audio/DiddyErrorT1.mp4',
        '/audio/OptimusErrorT1.mp4'
    ];
    const errorT2Audio = '/audio/SpongebobErrorT2.mp4';

    let audioContext: AudioContext | null;
    let analyser: AnalyserNode | null;
    let audioStream: MediaStream | null;
    let tickInterval: any;
    let audioCheckInterval: any;

    function formatTime(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function onAudioError() {
        console.log('Microphone access error');
    }

    async function setupAudio() {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(audioStream);
            source.connect(analyser);
            analyser.fftSize = 32;
            return true;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            onAudioError();
            return false;
        }
    }

    async function startVerification(fastTrack = false) {
        requiredSeconds = fastTrack ? 10 : 300;
        // reset state if starting fresh
        elapsed = 0;
        display = formatTime(elapsed);
        timerStarted = false; // Reset timer started flag
        verificationStarted = true;
        statusMessage = 'Ready to begin. Press Start when you are ready to shower.';
        statusClass = 'text-blue-600';

        const ok = await setupAudio();
        if (!ok) {
            verificationStarted = false;
            statusMessage = 'Microphone unavailable. Cannot verify.';
            statusClass = 'text-red-600';
            return;
        }

        // Do NOT auto-start the stopwatch - wait for user to click Start button
    }

    async function startStopwatch() {
        if (!analyser) {
            const ok = await setupAudio();
            if (!ok) {
                statusMessage = 'Microphone unavailable. Cannot start stopwatch.';
                statusClass = 'text-red-600';
                return;
            }
        }

        if (running) return;
        running = true;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Single interval for audio checking (UI updates)
        audioCheckInterval = setInterval(() => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avgVolume = sum / dataArray.length;
            volumePercent = Math.min(100, (avgVolume / 128) * 100);

            isAudioDetected = avgVolume > VOLUME_THRESHOLD;

            if (running) {
                if (isAudioDetected) {
                    // First time audio is detected, start the timer
                    if (!timerStarted) {
                        timerStarted = true;
                        statusMessage = 'Timer started! Water flow detected...';
                        statusClass = 'text-green-600 pulse-slow';
                    } else {
                        statusMessage = 'Water flow detected... accumulating time.';
                        statusClass = 'text-green-600 pulse-slow';
                    }
                    lowVolumeSince = null; // Reset timer when volume is detected
                    errorAudioPlayed = false; // Reset audio played flag
                } else {
                    // Only show error and play audio if timer has already started
                    if (timerStarted) {
                        statusMessage = 'WATER FLOW NOT DETECTED! Stopwatch paused.';
                        statusClass = 'text-red-600 shake';
                        if (lowVolumeSince === null) {
                            lowVolumeSince = Date.now();
                        }
                        // Play error sound after 0.5 seconds of low volume, but only once
                        if (Date.now() - lowVolumeSince > 500 && !errorAudioPlayed) {
                            playRandomErrorT1();
                            errorAudioPlayed = true;
                        }
                    } else {
                        statusMessage = 'Waiting for shower sounds to begin...';
                        statusClass = 'text-gray-600';
                    }
                }
            }
        }, 50);

        // Single interval for time accumulation - only count time if timer has started
        tickInterval = setInterval(() => {
            if (isAudioDetected && timerStarted) {
                elapsed += 1;
                display = formatTime(elapsed);
            }
        }, 1000);
    }

    function stopStopwatch() {
        running = false;
        clearInterval(audioCheckInterval);
        clearInterval(tickInterval);
        audioCheckInterval = null;
        tickInterval = null;

        // Show remaining time if stopped before threshold
        if (elapsed < requiredSeconds) {
            const remaining = requiredSeconds - elapsed;
            statusMessage = `Stopwatch stopped. You need ${formatTime(remaining)} more to complete verification.`;
            statusClass = 'text-orange-600';
        } else {
            statusMessage = 'Stopwatch stopped. You can resume or finish.';
            statusClass = 'text-gray-700';
        }

        // stop audio resources when fully stopped (not just paused)
        stopAudioStream();
    }

    function finishVerification() {
        // Stop any running timers first
        if (running) {
            stopStopwatch();
        }

        if (elapsed >= requiredSeconds) {
            statusMessage = 'Verification complete! Well done.';
            statusClass = 'text-green-600';
            totalTime.set(elapsed);
            // proceed to next view after a short delay
            setTimeout(() => showView('minigame'), 1200);
        } else {
            const remaining = requiredSeconds - elapsed;
            statusMessage = `Not enough shower time! You still need ${formatTime(remaining)}.`;
            statusClass = 'text-red-600 shake';
            playErrorT2();
        }
    }

    function playRandomErrorT1() {
        if (audioPlayer && !audioPlayer.paused) return; // Do not interrupt if already playing
        const randomIndex = Math.floor(Math.random() * errorT1Audios.length);
        audioPlayer.src = errorT1Audios[randomIndex];
        audioPlayer.play();
    }

    function playErrorT2() {
        if (audioPlayer && !audioPlayer.paused) return; // Do not interrupt if already playing
        audioPlayer.src = errorT2Audio;
        audioPlayer.play();
    }

    function stopAudioStream() {
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            audioStream = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        analyser = null;
    }

    onDestroy(() => {
        clearInterval(audioCheckInterval);
        clearInterval(tickInterval);
        stopAudioStream();
    });
</script>

<div class="app-view space-y-6 text-center">
    <h2 class="text-3xl font-bold">Step 2: Proof-of-Lather</h2>
    <p class="text-gray-600">We better hear you shower for at least 5 minutes. Turn on your microphone, place it near your shower and please shower (we can smell you from here 😭).</p>

    <audio bind:this={audioPlayer}></audio>

    {#if verificationStarted}
    <div class="space-y-4">
        <div class="bg-gray-900 text-white p-6 rounded-lg shadow-inner">
            <div class="text-sm uppercase text-gray-400">Time Accumulated</div>
            <div class="text-6xl font-extrabold tracking-tighter">{display}</div>
        </div>

        <div class="bg-gray-100 p-4 rounded-lg">
            <div class="text-sm uppercase text-gray-500 mb-2">Audio-Analytic Feed (Volume)</div>
            <div class="w-full bg-gray-300 rounded-full h-8 overflow-hidden">
                <div class="progress-bar-inner h-full bg-blue-500 rounded-full" style="width: {volumePercent}%;"></div>
            </div>
        </div>

        <div class="h-12 p-2 text-lg font-medium {statusClass}" role="alert">
            {statusMessage}
        </div>

        <div class="space-y-2">
            {#if running}
                <button on:click={() => stopStopwatch()} class="w-full bg-red-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition">Stop</button>
            {:else}
                <button on:click={startStopwatch} class="w-full bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition">Start</button>
            {/if}

            <button on:click={finishVerification} class="w-full bg-blue-700 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-lg hover:bg-blue-800 transition">
                Finish & Check Time
            </button>
        </div>
    </div>
    {:else}
    <div class="space-y-4">
        <button on:click={() => startVerification(false)} class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
            Start Verification (5 min requirement)
        </button>
        <button on:click={() => startVerification(true)} class="w-full bg-gray-700 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300">
            Hackathon Fast-Track (10s Demo)
        </button>
    </div>
    {/if}
</div>
