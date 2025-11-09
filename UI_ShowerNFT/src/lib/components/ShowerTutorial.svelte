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
      instruction: "🧴 Scrub your head/hair thoroughly",
      duration: 10,
    },
    {
      gesture: "scrub-armpits",
      instruction: "🙌 Raise your arms and scrub those armpits!",
      duration: 10,
    },
    {
      gesture: "scrub-butt",
      instruction: "🍑 Don't forget the butt! (Hand near hip area)",
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
    isLoading = true;
    loadError = "";

    try {
      console.log("🎥 Video ready, initializing pose detector...");
      await initPoseDetector();
      detector = getDetector();
      console.log("✅ Pose detector ready!");
      isLoading = false;
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
    Follow the on-screen instructions and perform each motion for 10 seconds.
  </p>

  <WebcamFeed onVideoReady={handleVideoReady}>
    {#if detector && videoElement && !isLoading}
      <PoseOverlay video={videoElement} {detector} />
    {/if}
  </WebcamFeed>

  {#if !isLoading && !loadError}
    <div class="bg-gray-50 border border-gray-200 p-3 rounded text-xs">
      <div class="font-bold text-gray-700 mb-2">🎯 Skeleton Visualization:</div>
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span>High Confidence (70%+)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Medium (50-70%)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Low (30-50%)</span>
        </div>
      </div>
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
      <p class="mt-2">Loading pose detection model...</p>
      <p class="text-xs mt-1 text-gray-400">
        This may take 5-10 seconds on first load
      </p>
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
