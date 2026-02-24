import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type TherapeuticIntent =
  | "I feel okay"
  | "I need a break"
  | "I agree"
  | "I disagree"
  | "I feel stressed"
  | "Unknown";

export interface GestureResult {
  intent: TherapeuticIntent;
  confidence: number;
  label: string; // Internal name like "ThumbsUp", "Peace"
}

// Helper to calculate 3D Euclidean distance between two landmarks
const calculateDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2),
  );
};

// Simple heuristic rule-based gesture recognition
export const analyzeHandGestures = (
  landmarks: NormalizedLandmark[],
): GestureResult => {
  if (!landmarks || landmarks.length < 21) {
    return { intent: "Unknown", confidence: 0, label: "None" };
  }

  // MediaPipe Hand Landmarks:
  // 0: Wrist, 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
  // MCPs (knuckles): 5 (Index), 9 (Middle), 13 (Ring), 17 (Pinky)

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const pinkyMcp = landmarks[17];
  const wrist = landmarks[0];

  // Helper flags
  const isThumbUp = thumbTip.y < indexMcp.y && thumbTip.y < pinkyMcp.y;
  const isThumbDown = thumbTip.y > wrist.y;

  // Fingers are 'up' if their tip is significantly higher (lower y-value) than their knuckle
  const isIndexUp = indexTip.y < indexMcp.y - 0.05;
  const isMiddleUp = middleTip.y < middleMcp.y - 0.05;
  const isRingUp = ringTip.y < landmarks[13].y - 0.05;
  const isPinkyUp = pinkyTip.y < pinkyMcp.y - 0.05;

  const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp;

  const distanceThumbIndex = calculateDistance(thumbTip, indexTip);

  // 1. Thumbs Up -> "I feel okay"
  if (isThumbUp && isFist) {
    return { intent: "I feel okay", confidence: 0.9, label: "ThumbsUp" };
  }

  // 2. Thumbs Down -> "I disagree" / "I feel bad"
  if (isThumbDown && isFist) {
    return { intent: "I disagree", confidence: 0.9, label: "ThumbsDown" };
  }

  // 3. Open Palm / Stop -> "I need a break"
  if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp && !isFist) {
    return { intent: "I need a break", confidence: 0.85, label: "OpenPalm" };
  }

  // 4. OK Sign (Thumb and Index touching, others up) -> "I agree"
  if (distanceThumbIndex < 0.05 && isMiddleUp && isRingUp && isPinkyUp) {
    return { intent: "I agree", confidence: 0.85, label: "OKSign" };
  }

  // 5. Peace Sign (Index and Middle up, others down) -> variant of "I feel okay" or "Feeling peaceful"
  if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
    return { intent: "I feel okay", confidence: 0.8, label: "Peace" };
  }

  // 6. Fist (Clenched, tense) -> "I feel stressed"
  if (isFist && !isThumbUp && !isThumbDown) {
    return { intent: "I feel stressed", confidence: 0.75, label: "Fist" };
  }

  return { intent: "Unknown", confidence: 0, label: "None" };
};
