import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Semantic translations of raw gestures
export type SemanticInsight =
  | "User agrees/understands"
  | "User distracted or uncomfortable"
  | "Possible low mood/fatigue"
  | "User wants to respond"
  | "Positive emotional response"
  | "User feeling stressed or tense"
  | "User needs a break"
  | "None";

export interface GestureResult {
  intent: SemanticInsight;
  confidence: number;
  label: string; // The raw gesture name like "Nodding", "Smiling"
}

// Helper to calculate 3D Euclidean distance between two landmarks
const calculateDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * Intelligent semantic translation of raw landmarks into clinical insights.
 * This function is designed to scale with Face and Pose landmarks.
 * Currently, it uses Hand landmarks and heuristic mock states to infer deeper meaning.
 */
export const analyzeGestures = (
  handLandmarks: NormalizedLandmark[] | null,
  faceLandmarks?: NormalizedLandmark[] | null,
  poseLandmarks?: NormalizedLandmark[] | null
): GestureResult => {
  
  // ── HAND GESTURE ANALYSIS ───────────────────────────────────────
  if (handLandmarks && handLandmarks.length >= 21) {
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const middleTip = handLandmarks[12];
    const ringTip = handLandmarks[16];
    const pinkyTip = handLandmarks[20];
    const indexMcp = handLandmarks[5];
    const middleMcp = handLandmarks[9];
    const pinkyMcp = handLandmarks[17];
    const wrist = handLandmarks[0];

    const isThumbUp = thumbTip.y < indexMcp.y && thumbTip.y < pinkyMcp.y;
    const isIndexUp = indexTip.y < indexMcp.y - 0.05;
    const isMiddleUp = middleTip.y < middleMcp.y - 0.05;
    const isRingUp = ringTip.y < handLandmarks[13].y - 0.05;
    const isPinkyUp = pinkyTip.y < pinkyMcp.y - 0.05;
    const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp;
    const distanceThumbIndex = calculateDistance(thumbTip, indexTip);

    // Raised Hand -> "User wants to respond"
    if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp && !isFist && wrist.y < 0.8) {
      return { intent: "User wants to respond", confidence: 0.85, label: "Raised Hand" };
    }

    // Thumbs Up -> "User agrees/understands"
    if (isThumbUp && isFist) {
      return { intent: "User agrees/understands", confidence: 0.9, label: "Thumbs Up" };
    }

    // Fist (clenched, tense) -> "User feeling stressed or tense"
    if (isFist && !isThumbUp && wrist.y > 0.5) {
      return { intent: "User feeling stressed or tense", confidence: 0.75, label: "Clenched Fist" };
    }

    // Open Palm Stop -> "User needs a break"
    if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp && distanceThumbIndex > 0.1) {
       return { intent: "User needs a break", confidence: 0.8, label: "Stop Sign" };
    }
  }

  // ── FACE & HEAD ANALYSIS ────────────────────────────────────────
  if (faceLandmarks && faceLandmarks.length > 0) {
    const noseTip = faceLandmarks[1];
    const leftMouth = faceLandmarks[61];
    const rightMouth = faceLandmarks[291];
    const topMouth = faceLandmarks[13];
    const bottomMouth = faceLandmarks[14];
    
    // Smile detection: Mouth corners are pulled up relative to the center
    const mouthWidth = calculateDistance(leftMouth, rightMouth);
    const smileThreshold = 0.08; // Adjust based on calibration
    const isSmiling = (leftMouth.y < bottomMouth.y - smileThreshold) && (rightMouth.y < bottomMouth.y - smileThreshold);

    if (isSmiling && mouthWidth > 0.1) {
      return { intent: "Positive emotional response", confidence: 0.85, label: "Smiling" };
    }

    // Look away / Distracted: Nose tip is far off-center
    if (noseTip.x < 0.35 || noseTip.x > 0.65) {
      return { intent: "User distracted or uncomfortable", confidence: 0.8, label: "Looking Away" };
    }

    // Nodding (simulated via rapid vertical movement tracked over frames, simplified here as tilted down)
    if (noseTip.y > 0.6) {
       // Just a heuristic for "head down" / slouching
       return { intent: "Possible low mood/fatigue", confidence: 0.7, label: "Looking Down" };
    }
  }

  // ── POSE ANALYSIS ───────────────────────────────────────────────
  if (poseLandmarks && poseLandmarks.length > 0) {
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const nose = poseLandmarks[0];

    // Slouched posture: Shoulders are very low relative to the head, or uneven
    if (leftShoulder.y > nose.y + 0.3 && rightShoulder.y > nose.y + 0.3) {
      return { intent: "Possible low mood/fatigue", confidence: 0.75, label: "Slouched Posture" };
    }
  }

  return { intent: "None", confidence: 0, label: "None" };
};
