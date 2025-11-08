<script lang="ts">
  import { showView, totalTime } from "$lib/stores";
  import { onMount, onDestroy } from "svelte";

  let verificationStarted = false;
  let timer = 300;
  let timerDisplay = "5:00";
  let volumePercent = 0;
  let statusMessage = "Verification in Progress...";
  let statusClass = "text-green-600 pulse-slow";

  let audioContext: AudioContext | null;
  let analyser: AnalyserNode | null;
  let audioStream: MediaStream | null;
  let timerInterval: any;

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  async function startVerification(fastTrack = false) {
    const duration = fastTrack ? 10 : 300;
    totalTime.set(duration);
    timer = duration;
    timerDisplay = formatTime(timer);
    verificationStarted = true;

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      analyser.fftSize = 32;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      timerInterval = setInterval(() => {
        checkAudio(dataArray);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      statusMessage = "Microphone access denied! Verification failed.";
      statusClass = "text-red-600 shake";
      setTimeout(() => {
        verificationStarted = false;
        statusMessage = "Verification in Progress...";
        statusClass = "text-green-600 pulse-slow";
      }, 3000);
    }
  }

  function checkAudio(dataArray: Uint8Array) {
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    let avgVolume = sum / dataArray.length;

    volumePercent = Math.min(100, (avgVolume / 128) * 100);

    if (avgVolume > 10) {
      timer--;
      timerDisplay = formatTime(timer);
      statusMessage = "Water flow detected... Verification proceeding.";
      statusClass = "text-green-600 pulse-slow";

      if (timer <= 0) {
        clearInterval(timerInterval);
        stopAudioStream();
        showView("minigame");
      }
    } else {
      statusMessage = "WATER FLOW NOT DETECTED! VERIFICATION PAUSED!";
      statusClass = "text-red-600 shake";
    }
  }

  function stopAudioStream() {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      audioStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  onDestroy(() => {
    clearInterval(timerInterval);
    stopAudioStream();
  });

  function skipToMinting() {
    clearInterval(timerInterval);
    stopAudioStream();
    showView("minting");
  }
</script>

<div class="app-view space-y-6 text-center">
  <!-- Debug Skip Button -->
  <button
    on:click={skipToMinting}
    class="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded shadow"
    title="Skip to minting (debug)"
  >
    ⚡ Debug
  </button>

  <h2 class="text-3xl font-bold">Step 2: Proof-of-Lather</h2>
  <p class="text-gray-600">
    Our patented audio-analytic AI will now verify your 5-minute continuous
    ablution. Place your device in a safe, dry location and begin your shower.
  </p>

  {#if verificationStarted}
    <div class="space-y-4">
      <div class="bg-gray-900 text-white p-6 rounded-lg shadow-inner">
        <div class="text-sm uppercase text-gray-400">Time Remaining</div>
        <div class="text-7xl font-extrabold tracking-tighter">
          {timerDisplay}
        </div>
      </div>

      <div class="bg-gray-100 p-4 rounded-lg">
        <div class="text-sm uppercase text-gray-500 mb-2">
          Audio-Analytic Feed (Volume)
        </div>
        <div class="w-full bg-gray-300 rounded-full h-8 overflow-hidden">
          <div
            class="progress-bar-inner h-full bg-blue-500 rounded-full"
            style="width: {volumePercent}%;"
          ></div>
        </div>
      </div>

      <div class="h-12 p-2 text-lg font-medium {statusClass}" role="alert">
        {statusMessage}
      </div>
    </div>
  {:else}
    <div class="space-y-4">
      <button
        on:click={() => startVerification(false)}
        class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
      >
        Start 5-Minute Verification
      </button>
      <button
        on:click={() => startVerification(true)}
        class="w-full bg-gray-700 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300"
      >
        Hackathon Fast-Track (10s Demo)
      </button>
    </div>
  {/if}
</div>
