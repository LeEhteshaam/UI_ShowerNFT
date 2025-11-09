# Interactive Shower Tutorial - Technical Documentation

## Overview

ML-powered webcam verification using TensorFlow.js MoveNet pose detection. Users perform 4 shower gestures (10 seconds each) with real-time skeleton visualization.

**Component Hierarchy**: `ShowerTutorial` → `WebcamFeed` → `PoseOverlay` (ML inference) + `ShowerStep` (gesture validation)

**Data Flow**: Video → PoseOverlay (30 FPS) → `$currentPoses` store → ShowerStep validates gesture → Timer advances only when active

---

## Core Components

### 1. ShowerTutorial.svelte

Orchestrates 4-step flow, initializes TensorFlow.js WebGL backend, tracks completion.

**Steps**: Rub hands (10s), Scrub head (10s), Scrub arms (10s), Scrub armpits (10s)

### 2. WebcamFeed.svelte

Manages MediaStream (640x480), handles permissions, provides video element to children via slot.

### 3. PoseOverlay.svelte

Runs MoveNet Lightning at 30 FPS, draws skeleton on canvas, writes to `currentPoses` store.

**Visualization**: Green/yellow/orange dots (by confidence), green connecting lines, confidence % overlay

**Performance**: Frame throttling (30 FPS target), single inference pipeline (no duplicate detections)

### 4. ShowerStep.svelte

Reads from `$currentPoses` store, validates gesture, controls countdown timer (pauses when gesture fails).

**Gesture Detection**:

## State Management

Svelte stores in `stores.ts`:

- `currentPoses`: Shared pose data (PoseOverlay writes, ShowerStep reads)
- `tutorialCompleted`: Completion flag for Firebase persistence

**Why stores?** Eliminates prop drilling, single source of truth, reactive updates across components.

---

## Performance Optimizations

1. **Single Inference Pipeline**: PoseOverlay runs once (30ms/frame), ShowerStep just reads → 2x performance improvement
2. **Frame Throttling**: Target 30 FPS (good balance of responsiveness vs CPU usage)
3. **Canvas Rendering**: Hardware-accelerated, `pointer-events: none` to prevent blocking clicks

**Metrics**: Model load ~5-10s, inference ~25-35ms/frame, ~150MB memory, ~30-40% CPU (single core)

---

## Debug Features

**Console Logs** (emoji-coded):

- 🎥 Video ready, ✅ Detector ready, 🔄 New gesture, ✅ Gesture detected, ⏱️ Timer tick

**Skip Buttons**: Debug (top-right), Skip Tutorial (bottom), Skip to Next Step (on error)

---

## Browser Compatibility

**Requirements**: WebGL 2.0, getUserMedia API, ES2020

**Tested**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14.1+ ✅  
**Not Supported**: Internet Explorer ❌

---

## Adding New Gestures

1. Add type to `poseDetector.ts`: `export type GestureType = ... | "wave-goodbye";`
2. Add detection logic to `ShowerStep.svelte` switch statement
3. Add to steps array in `ShowerTutorial.svelte`

**Reusable for**: Fitness apps (squats, pushups), dance games (dab, floss), sign language validation

---

## Troubleshooting

- **Model stuck loading**: Check Network tab for tfjs-model files, try self-hosting in `/public/models/`
- **Timer not progressing**: Check console for gesture detection logs, adjust thresholds in ShowerStep
- **Skeleton not drawing**: Verify canvas z-index, detector not null, dimensions match video
- **Choppy performance**: Lower FPS to 20, reduce video resolution to 320x240

---

**Status**: Production-ready for hackathon demo  
**Key Innovation**: Pause-on-stop timer prevents cheating, creates authentic verification experience
