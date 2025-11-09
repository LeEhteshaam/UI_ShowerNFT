<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import { view, currentUser, hasCompletedOnboarding } from "$lib/stores";
  import { preloadModel } from "$lib/ml/poseDetector";
  import { initAuthListener } from "$lib/authService";
  import Dashboard from "$lib/components/Dashboard.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import Tutorial from "$lib/components/Tutorial.svelte";
  import ShowerTutorial from "$lib/components/ShowerTutorial.svelte";
  import Verification from "$lib/components/Verification.svelte";
  import MiniGame from "$lib/components/MiniGame.svelte";
  import Minting from "$lib/components/Minting.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import Complete from "$lib/components/Complete.svelte";
  import Login from "$lib/components/Login.svelte";
  import Onboarding from "$lib/components/Onboarding.svelte";

  const components = {
    login: Login,
    onboarding: Onboarding,
    dashboard: Dashboard,
    hero: Hero,
    tutorial: Tutorial,
    showertutorial: ShowerTutorial,
    verification: Verification,
    minigame: MiniGame,
    minting: Minting,
    loading: Loading,
    complete: Complete,
  };

  // 🚀 PRELOAD MODEL IMMEDIATELY ON APP START FOR INSTANT TUTORIAL!
  onMount(() => {
    console.log(
      "🎯 App mounted, preloading TensorFlow.js model in background..."
    );
    preloadModel();

    // Initialize Firebase auth listener
    initAuthListener();
  });

  // Redirect to login if not authenticated
  $: if (!$currentUser && $view !== "login") {
    view.set("login");
  }

  // Redirect to onboarding if authenticated but not onboarded
  $: if ($currentUser && !$hasCompletedOnboarding && $view !== "onboarding") {
    view.set("onboarding");
  }

  // Redirect to dashboard after onboarding
  $: if ($currentUser && $hasCompletedOnboarding && $view === "onboarding") {
    view.set("dashboard");
  }
</script>

<main
  class="bg-gray-100 text-gray-900 min-h-screen flex items-center justify-center p-4"
>
  <div
    class="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 md:p-12 mx-auto"
  >
    <svelte:component this={components[$view as keyof typeof components]} />
  </div>
</main>
