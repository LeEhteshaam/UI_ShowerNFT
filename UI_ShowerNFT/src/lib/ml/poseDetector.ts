import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { gestureAnalysis, targetGesture, currentPoses } from '$lib/stores';
import { get } from 'svelte/store';

export type GestureType = 'scrub-head' | 'scrub-armpits' | 'scrub-butt';

export interface PoseAnalysis {
    isActive: boolean; // Are hands moving in correct position?
    confidence: number;
    gesture: GestureType | null;
}

let detector: poseDetection.PoseDetector | null = null;
let isInitializing = false;

export async function initPoseDetector() {
    if (detector) return detector;
    
    // Prevent duplicate initialization
    if (isInitializing) {
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return detector;
    }
    
    isInitializing = true;
    
    try {
        console.log('🔧 Initializing TensorFlow.js backend...');
        
        // Force WebGL backend (avoid WebGPU issues)
        await tf.setBackend('webgl');
        await tf.ready();
        
        console.log('✅ TensorFlow.js backend ready:', tf.getBackend());
        console.log('📥 Loading MoveNet model...');
        
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );
        
        console.log('✅ MoveNet model loaded successfully!');
        return detector;
    } catch (error) {
        console.error('❌ Failed to initialize pose detector:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
}

// Analyze poses from the store and update gestureAnalysis store
export function analyzePosesFromStore() {
    const poses = get(currentPoses);
    const gesture = get(targetGesture);
    
    if (poses.length === 0 || !gesture) {
        gestureAnalysis.set({ isActive: false, confidence: 0, gesture: null });
        return;
    }
    
    const pose = poses[0];
    const keypoints = pose.keypoints;
    
    // Get key body parts
    const leftWrist = keypoints.find((kp: any) => kp.name === 'left_wrist');
    const rightWrist = keypoints.find((kp: any) => kp.name === 'right_wrist');
    const nose = keypoints.find((kp: any) => kp.name === 'nose');
    const leftShoulder = keypoints.find((kp: any) => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find((kp: any) => kp.name === 'right_shoulder');
    const leftHip = keypoints.find((kp: any) => kp.name === 'left_hip');
    const rightHip = keypoints.find((kp: any) => kp.name === 'right_hip');
    
    // Detect motion based on target gesture
    let analysis: PoseAnalysis;
    switch (gesture) {
        case 'scrub-head':
            analysis = detectHeadScrubbing(leftWrist, rightWrist, nose);
            break;
        case 'scrub-armpits':
            analysis = detectArmpitScrubbing(leftWrist, rightWrist, leftShoulder, rightShoulder);
            break;
        case 'scrub-butt':
            analysis = detectButtScrubbing(leftWrist, rightWrist, leftHip, rightHip, leftShoulder, rightShoulder);
            break;
        default:
            analysis = { isActive: false, confidence: 0, gesture: null };
    }
    
    gestureAnalysis.set(analysis);
}

// Helper detection functions
function detectHeadScrubbing(
    leftWrist: any,
    rightWrist: any,
    nose: any
): PoseAnalysis {
    if (!nose) {
        return { isActive: false, confidence: 0, gesture: null };
    }
    
    // Check if either hand is near head
    const leftDist = leftWrist ? Math.sqrt(
        Math.pow(leftWrist.x - nose.x, 2) +
        Math.pow(leftWrist.y - nose.y, 2)
    ) : Infinity;
    
    const rightDist = rightWrist ? Math.sqrt(
        Math.pow(rightWrist.x - nose.x, 2) +
        Math.pow(rightWrist.y - nose.y, 2)
    ) : Infinity;
    
    const isScrubbing = leftDist < 150 || rightDist < 150;
    const confidence = Math.max(leftWrist?.score || 0, rightWrist?.score || 0);
    
    return {
        isActive: isScrubbing && confidence > 0.3,
        confidence,
        gesture: isScrubbing ? 'scrub-head' : null
    };
}

function detectArmpitScrubbing(
    leftWrist: any,
    rightWrist: any,
    leftShoulder: any,
    rightShoulder: any
): PoseAnalysis {
    // Check if hand is raised and near shoulder height (armpits)
    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
        return { isActive: false, confidence: 0, gesture: null };
    }
    
    // Check if hand is raised and near shoulder height
    const leftHandUp = leftWrist.y < leftShoulder.y;
    const rightHandUp = rightWrist.y < rightShoulder.y;
    
    const isScrubbing = leftHandUp || rightHandUp;
    const confidence = Math.max(leftWrist.score, rightWrist.score);
    
    return {
        isActive: isScrubbing && confidence > 0.3,
        confidence,
        gesture: isScrubbing ? 'scrub-armpits' : null
    };
}

function detectButtScrubbing(
    leftWrist: any,
    rightWrist: any,
    leftHip: any,
    rightHip: any,
    leftShoulder: any,
    rightShoulder: any
): PoseAnalysis {
    // Check if hands are near hip area (butt scrubbing!)
    if (!leftWrist || !rightWrist || !leftHip || !rightHip || !leftShoulder || !rightShoulder) {
        return { isActive: false, confidence: 0, gesture: null };
    }
    
    // Calculate distance from wrists to hips
    const leftWristToLeftHip = Math.sqrt(
        Math.pow(leftWrist.x - leftHip.x, 2) +
        Math.pow(leftWrist.y - leftHip.y, 2)
    );
    
    const rightWristToRightHip = Math.sqrt(
        Math.pow(rightWrist.x - rightHip.x, 2) +
        Math.pow(rightWrist.y - rightHip.y, 2)
    );
    
    const leftWristToRightHip = Math.sqrt(
        Math.pow(leftWrist.x - rightHip.x, 2) +
        Math.pow(leftWrist.y - rightHip.y, 2)
    );
    
    const rightWristToLeftHip = Math.sqrt(
        Math.pow(rightWrist.x - leftHip.x, 2) +
        Math.pow(rightWrist.y - leftHip.y, 2)
    );
    
    // Check if hands are lowered (below shoulders) and near hips
    const leftHandLowered = leftWrist.y > leftShoulder.y;
    const rightHandLowered = rightWrist.y > rightShoulder.y;
    const handsLowered = leftHandLowered || rightHandLowered;
    
    // Check if either hand is near any hip (generous threshold for easier detection)
    const threshold = 200;
    const nearHips = 
        leftWristToLeftHip < threshold || 
        rightWristToRightHip < threshold ||
        leftWristToRightHip < threshold ||
        rightWristToLeftHip < threshold;
    
    const isScrubbing = handsLowered && nearHips;
    const confidence = Math.max(leftWrist.score, rightWrist.score);
    
    return {
        isActive: isScrubbing && confidence > 0.3,
        confidence,
        gesture: isScrubbing ? 'scrub-butt' : null
    };
}

export function cleanupDetector() {
    if (detector) {
        detector.dispose();
        detector = null;
    }
}

export function getDetector() {
    return detector;
}
