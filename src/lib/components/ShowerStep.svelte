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
  let audioElement: HTMLAudioElement | null = null;
  let hasPlayedAudio = false;

  // Subscribe to gesture analysis from ML module
  $: isActive = $gestureAnalysis.isActive;
  $: confidence = $gestureAnalysis.confidence;

  // Play audio for specific gestures on load
  function playGestureAudio(gesture: GestureType) {
    let audioPath = "";
    
    if (gesture === "scrub-head") {
      audioPath = "/audio/diddyHairHead.mp4";
    } else if (gesture === "scrub-armpits") {
      audioPath = "/audio/diddyArmPitts.mp4";
    }
    
    if (audioPath && !hasPlayedAudio) {
      audioElement = new Audio(audioPath);
      audioElement.play().catch(err => {
        console.error("Failed to play audio:", err);
      });
      hasPlayedAudio = true;
    }
  }

  // Reset timer when gesture changes (new step)
  $: if (gesture) {
    console.log(`🔄 New gesture: ${gesture}, resetting timer`);
    timeRemaining = durationSeconds;
    hasPlayedAudio = false;

    // Tell ML module what gesture to look for
    targetGesture.set(gesture);

    // Play audio for this gesture
    playGestureAudio(gesture);

    // Restart the timer for the new step
    stopTimer();
    startTimer();
  }

  function startTimer() {
    if (isTimerRunning) return; // Prevent duplicate timers
    isTimerRunning = true;

    interval = setInterval(() => {
      if (isActive && timeRemaining > 0) {
        // Play butt audio when timer starts counting down for butt gesture
        if (gesture === "scrub-butt" && timeRemaining === durationSeconds && !hasPlayedAudio) {
          audioElement = new Audio("/audio/diddyBooty.mp4");
          audioElement.play().catch(err => {
            console.error("Failed to play audio:", err);
          });
          hasPlayedAudio = true;
        }
        
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
    
    // Clean up audio element
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }
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
