<script lang="ts">
  import { showView } from "$lib/stores";

  let certified = false;

  function skipToMinting() {
    showView("minting");
  }
</script>

<div class="app-view space-y-6">
  <!-- Debug Skip Button -->
  <button
    on:click={skipToMinting}
    class="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded shadow"
    title="Skip to minting (debug)"
  >
    ⚡ Debug
  </button>

  <h2 class="text-3xl font-bold text-center">
    Step 1: Shower Approved™ Tutorial
  </h2>
  <p class="text-gray-600">
    Before verification, you must be certified in the optimal H₂O-to-epidermis
    application protocol. Please review the following modules.
  </p>
  <div
    class="h-64 overflow-y-scroll p-4 border rounded-lg bg-gray-50 space-y-4 text-sm"
  >
    <h3 class="font-bold">Module 1: Water Temperature Calibration</h3>
    <p>
      A successful ablution requires a precise temperature of 41.5°C (±0.2°).
      Temperatures exceeding this risk epidermal shock, while lower temperatures
      fail to activate the soap-saponification coefficient. Calibrate your
      sensor (hand) accordingly.
    </p>

    <h3 class="font-bold">Module 2: The Lather-Rinse-Repeat Fallacy</h3>
    <p>
      Our research indicates the "repeat" step is a sub-optimal loop propagated
      by shampoo conglomerates. The Groom Protocol dictates a single,
      high-efficiency Lather-Rinse cycle. We are a Proof-of-Lather, not
      Proof-of-Waste, protocol.
    </p>

    <h3 class="font-bold">Module 3: Advanced Towel Dynamics</h3>
    <p>
      Do NOT rub. Rubbing introduces unnecessary friction and micro-abrasions.
      The approved method is a firm, systematic "Pat" (Protocol-Assisted
      Tepid-drying). This ensures moisture removal while maintaining skin
      integrity.
    </p>
  </div>
  <div class="flex items-center space-x-3">
    <input
      id="tutorial-check"
      type="checkbox"
      bind:checked={certified}
      class="h-5 w-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <label for="tutorial-check" class="text-gray-700"
      >I certify I have completed the pre-shower<br />hygiene-protocol
      orientation.</label
    >
  </div>
  <button
    on:click={() => showView("verification")}
    disabled={!certified}
    class="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
    class:opacity-50={!certified}
    class:cursor-not-allowed={!certified}
  >
    I Am Shower Approved™
  </button>
</div>
