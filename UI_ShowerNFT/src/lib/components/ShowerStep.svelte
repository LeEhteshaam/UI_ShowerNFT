<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { GestureType } from "$lib/ml/poseDetector";
  import { targetGesture, gestureAnalysis } from "$lib/stores";

  export let gesture: GestureType;
  export let instruction: string;
  export let durationSeconds = 10;
  export let onComplete: () => void;

  let timeRemaining = durationSeconds;
  let interval: any;
  let isTimerRunning = false;

  // Subscribe to gesture analysis from ML module
  $: isActive = $gestureAnalysis.isActive;
  $: confidence = $gestureAnalysis.confidence;

  // Reset timer when gesture changes (new step)
  $: if (gesture) {
    console.log(`🔄 New gesture: ${gesture}, resetting timer`);
    timeRemaining = durationSeconds;

    // Tell ML module what gesture to look for
    targetGesture.set(gesture);

    // Restart the timer for the new step
    stopTimer();
    startTimer();
  }

  function startTimer() {
    if (isTimerRunning) return; // Prevent duplicate timers
    isTimerRunning = true;

    interval = setInterval(() => {
      if (isActive && timeRemaining > 0) {
        timeRemaining--;
        console.log(
          `⏱️ Timer tick: ${timeRemaining}s remaining (active: ${isActive})`
        );
        if (timeRemaining <= 0) {
          stopTimer();
          onComplete();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    isTimerRunning = false;
  }

  onMount(() => {
    console.log(`🚀 ShowerStep mounted for gesture: ${gesture}`);
    startTimer();
  });

  onDestroy(() => {
    console.log(`🛑 ShowerStep destroyed for gesture: ${gesture}`);
    stopTimer();
  });

  $: statusClass = isActive ? "text-green-600" : "text-red-600";
  $: statusMessage = isActive
    ? `Great! Keep going... (${Math.round(confidence * 100)}% confidence)`
    : "Start the motion to continue timer!";
</script>

<div class="shower-step space-y-4">
  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
    <p class="text-lg font-bold text-blue-900">{instruction}</p>
  </div>

  <div class="bg-gray-900 text-white p-6 rounded-lg shadow-inner">
    <div class="text-sm uppercase text-gray-400">Time Remaining</div>
    <div class="text-6xl font-extrabold tracking-tighter">{timeRemaining}s</div>
  </div>

  <div
    class="h-12 p-2 text-lg font-medium {statusClass} text-center"
    role="alert"
  >
    {statusMessage}
  </div>

  <div class="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
    <div
      class="bg-green-500 h-full rounded-full transition-all duration-300"
      style="width: {((durationSeconds - timeRemaining) / durationSeconds) *
        100}%;"
    ></div>
  </div>
</div>
