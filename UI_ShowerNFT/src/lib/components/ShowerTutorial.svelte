<script lang="ts">
  import { showView, tutorialCompleted } from "$lib/stores";
  import { onDestroy } from "svelte";
  import WebcamFeed from "./WebcamFeed.svelte";
  import ShowerStep from "./ShowerStep.svelte";
  import PoseOverlay from "./PoseOverlay.svelte";
  import {
    initPoseDetector,
    cleanupDetector,
    getDetector,
    type GestureType,
  } from "$lib/ml/poseDetector";

  interface TutorialStep {
    gesture: GestureType;
    instruction: string;
    duration: number;
  }

  const steps: TutorialStep[] = [
    {
      gesture: "scrub-head",
      instruction: "Scrub your head with both hands! 🧴",
      duration: 10,
    },
    {
      gesture: "scrub-armpits",
      instruction: "Wash those armpits! Raise your arms! 💪",
      duration: 10,
    },
    {
      gesture: "scrub-butt",
      instruction: "Scrub that booty! Judges will love this! 🍑",
      duration: 10,
    },
  ];

  let currentStepIndex = 0;
  let videoElement: HTMLVideoElement | null = null;
  let isLoading = true;
  let loadError = "";
  let detector: any = null;

  async function handleVideoReady(video: HTMLVideoElement) {
    videoElement = video;
    loadError = "";

    try {
      console.log("📹 Webcam ready, initializing pose detector...");
      // Model should already be preloaded - this returns instantly! ⚡
      await initPoseDetector();
      detector = getDetector();
      isLoading = false;
      console.log("✅ Pose detector ready (preloaded!)");
    } catch (error) {
      console.error("❌ Pose detector initialization failed:", error);
      loadError =
        "Failed to load ML model. Please refresh the page or use the skip option.";
      isLoading = false;
    }
  }

  function handleStepComplete() {
    currentStepIndex++;
    if (currentStepIndex >= steps.length) {
      // Mark tutorial as completed
      tutorialCompleted.set(true);
      showView("verification"); // Proceed to next flow
    }
  }

  function skipTutorial() {
    tutorialCompleted.set(true);
    showView("verification");
  }

  function skipToMinting() {
    tutorialCompleted.set(true);
    showView("minting");
  }

  onDestroy(() => {
    cleanupDetector();
  });

  $: currentStep = steps[currentStepIndex];
</script>

<div class="app-view space-y-6">
  <!-- Debug Skip Button -->
  <button
    on:click={skipToMinting}
    class="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded shadow z-10"
    title="Skip to minting (debug)"
  >
    ⚡ Debug
  </button>

  <h2 class="text-3xl font-bold text-center">Interactive Shower Tutorial</h2>
  <p class="text-gray-600 text-center">
    Complete all steps to prove you showered! 🚿
  </p>

  <WebcamFeed onVideoReady={handleVideoReady}>
    {#if detector && videoElement && !isLoading}
      <PoseOverlay video={videoElement} {detector} />
    {/if}
  </WebcamFeed>

  {#if !isLoading && !loadError}
    <div class="bg-green-50 border border-green-200 p-3 rounded text-sm">
      <p class="text-green-700 font-medium">
        ✅ Model loaded! (Preloaded on app start for instant demo)
      </p>
    </div>
  {/if}

  {#if loadError}
    <div class="text-center bg-red-50 border border-red-200 p-6 rounded-lg">
      <p class="text-red-700 font-medium mb-4">{loadError}</p>
      <button
        on:click={skipTutorial}
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Skip to Next Step
      </button>
    </div>
  {:else if isLoading}
    <div class="text-center text-gray-500">
      <div
        class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
      ></div>
      <p class="mt-2">⚡ Initializing (should be instant!)...</p>
    </div>
  {:else if currentStep}
    <ShowerStep
      gesture={currentStep.gesture}
      instruction={currentStep.instruction}
      durationSeconds={currentStep.duration}
      onComplete={handleStepComplete}
    />

    <div class="text-center text-sm text-gray-500">
      Step {currentStepIndex + 1} of {steps.length}
    </div>
  {/if}

  <div class="text-center">
    <button
      on:click={skipTutorial}
      class="text-sm text-blue-600 hover:text-blue-800 underline"
    >
      Skip Tutorial (if already completed)
    </button>
  </div>
</div>
