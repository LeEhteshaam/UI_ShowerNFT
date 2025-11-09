<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as poseDetection from "@tensorflow-models/pose-detection";
  import { currentPoses } from "$lib/stores";
  import { analyzePosesFromStore } from "$lib/ml/poseDetector";

  export let video: HTMLVideoElement | null;
  export let detector: any; // PoseDetector instance
  export let showSkeleton = true;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let animationFrame: number;
  let lastFrameTime = 0;
  const targetFPS = 30; // Cap at 30 FPS for smooth performance
  const frameInterval = 1000 / targetFPS;

  // Separate update rate for confidence score (slower to reduce flicker)
  let lastConfidenceUpdateTime = 0;
  const confidenceUpdateInterval = 100; // Update confidence text every 100ms (1 FPS)
  let displayedConfidence = "0";

  // MoveNet skeleton connections (which keypoints connect to which)
  const connections = [
    ["nose", "left_eye"],
    ["nose", "right_eye"],
    ["left_eye", "left_ear"],
    ["right_eye", "right_ear"],
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];

  async function drawPose(timestamp: number) {
    if (!video || !canvas || !ctx || !detector) {
      animationFrame = requestAnimationFrame(drawPose);
      return;
    }

    // Throttle to target FPS
    const elapsed = timestamp - lastFrameTime;
    if (elapsed < frameInterval) {
      animationFrame = requestAnimationFrame(drawPose);
      return;
    }
    lastFrameTime = timestamp;

    const context = ctx; // TypeScript null check helper

    // Match canvas size to video
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const poses = await detector.estimatePoses(video);

      // Update shared store with raw poses
      currentPoses.set(poses);

      // Trigger gesture analysis (ML logic in poseDetector.ts)
      analyzePosesFromStore();

      if (poses.length > 0 && showSkeleton) {
        const pose = poses[0];
        const keypoints = pose.keypoints;

        // Draw connections (skeleton lines)
        context.strokeStyle = "#00ff00";
        context.lineWidth = 3;
        connections.forEach(([start, end]) => {
          const startPoint = keypoints.find((kp: any) => kp.name === start);
          const endPoint = keypoints.find((kp: any) => kp.name === end);

          if (
            startPoint &&
            endPoint &&
            startPoint.score > 0.3 &&
            endPoint.score > 0.3
          ) {
            context.beginPath();
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(endPoint.x, endPoint.y);
            context.stroke();
          }
        });

        // Draw keypoints (joints)
        keypoints.forEach((keypoint: any) => {
          if (keypoint.score > 0.3) {
            // Draw outer circle (white)
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
            context.fill();

            // Draw inner circle (color-coded by confidence)
            const confidence = keypoint.score;
            if (confidence > 0.7) {
              context.fillStyle = "#00ff00"; // Green - high confidence
            } else if (confidence > 0.5) {
              context.fillStyle = "#ffff00"; // Yellow - medium confidence
            } else {
              context.fillStyle = "#ff6600"; // Orange - low confidence
            }
            context.beginPath();
            context.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
            context.fill();
          }
        });

        // Calculate confidence score (update less frequently to reduce flicker)
        const avgConfidence = (
          (keypoints.reduce((sum: number, kp: any) => sum + kp.score, 0) /
            keypoints.length) *
          100
        ).toFixed(0);

        // Only update displayed confidence every 500ms
        if (timestamp - lastConfidenceUpdateTime > confidenceUpdateInterval) {
          displayedConfidence = avgConfidence;
          lastConfidenceUpdateTime = timestamp;
        }

        // Draw confidence score (using smoothed value)
        context.fillStyle = "#ffffff";
        context.font = "bold 16px monospace";
        context.strokeStyle = "#000000";
        context.lineWidth = 3;
        const text = `Detection: ${displayedConfidence}%`;
        context.strokeText(text, 10, 30);
        context.fillText(text, 10, 30);
      }
    } catch (error) {
      console.error("Error drawing pose:", error);
    }

    animationFrame = requestAnimationFrame(drawPose);
  }

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext("2d");
      animationFrame = requestAnimationFrame(drawPose);
    }
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<canvas
  bind:this={canvas}
  class="absolute top-0 left-0 w-full h-full pointer-events-none"
  style="z-index: 10;"
></canvas>
