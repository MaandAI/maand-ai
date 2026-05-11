import { NormalizedLandmark } from "@mediapipe/tasks-vision";

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
  label: string;
  source: "hand" | "face" | "pose" | "none";
}

// ── Helpers ────────────────────────────────────────────────────────────────

const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) =>
  Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2),
  );

const NONE: GestureResult = {
  intent: "None",
  confidence: 0,
  label: "None",
  source: "none",
};

// ── Hand Analysis ──────────────────────────────────────────────────────────
// MediaPipe hand landmark indices:
//   0=wrist, 4=thumb tip, 5=index MCP, 8=index tip,
//   9=middle MCP, 12=middle tip, 13=ring MCP, 16=ring tip,
//   17=pinky MCP, 20=pinky tip

function analyzeHand(lm: NormalizedLandmark[]): GestureResult | null {
  if (lm.length < 21) return null;

  const wrist = lm[0];
  const thumbTip = lm[4];
  const indexMcp = lm[5];
  const indexTip = lm[8];
  const middleMcp = lm[9];
  const middleTip = lm[12];
  const ringMcp = lm[13];
  const ringTip = lm[16];
  const pinkyMcp = lm[17];
  const pinkyTip = lm[20];

  // Finger extension — tip clearly above its MCP joint (y is inverted in normalized coords)
  const indexUp = indexTip.y < indexMcp.y - 0.04;
  const middleUp = middleTip.y < middleMcp.y - 0.04;
  const ringUp = ringTip.y < ringMcp.y - 0.04;
  const pinkyUp = pinkyTip.y < pinkyMcp.y - 0.04;

  const allFingersUp = indexUp && middleUp && ringUp && pinkyUp;
  const isFist = !indexUp && !middleUp && !ringUp && !pinkyUp;

  // Thumb: compare tip to index MCP and pinky MCP — if above both, thumb is raised
  const thumbUp = thumbTip.y < indexMcp.y && thumbTip.y < pinkyMcp.y;

  const thumbIndexDist = dist(thumbTip, indexTip);

  // ── Gesture rules (ordered by specificity) ──────────────────────

  // Open palm / stop sign — all four fingers up and spread (thumb out)
  // Differentiate from "raised hand" by thumb being extended outward
  if (allFingersUp && thumbIndexDist > 0.12) {
    return {
      intent: "User needs a break",
      confidence: 0.85,
      label: "Open Palm",
      source: "hand",
    };
  }

  // Raised hand — all fingers up, thumb tucked, hand elevated in frame
  if (allFingersUp && !thumbUp && wrist.y < 0.75) {
    return {
      intent: "User wants to respond",
      confidence: 0.85,
      label: "Raised Hand",
      source: "hand",
    };
  }

  // Thumbs up — only thumb extended, rest in fist
  if (thumbUp && isFist) {
    return {
      intent: "User agrees/understands",
      confidence: 0.92,
      label: "Thumbs Up",
      source: "hand",
    };
  }

  // Peace / V sign — index and middle up, rest down
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return {
      intent: "Positive emotional response",
      confidence: 0.8,
      label: "Peace Sign",
      source: "hand",
    };
  }

  // Pointing — only index up
  if (indexUp && !middleUp && !ringUp && !pinkyUp) {
    return {
      intent: "User wants to respond",
      confidence: 0.75,
      label: "Pointing",
      source: "hand",
    };
  }

  // Clenched fist — all down, thumb not raised, hand not too high (exclude fist-at-rest)
  if (isFist && !thumbUp && wrist.y > 0.4) {
    return {
      intent: "User feeling stressed or tense",
      confidence: 0.78,
      label: "Clenched Fist",
      source: "hand",
    };
  }

  // OK sign — thumb and index form a small circle
  if (thumbIndexDist < 0.04 && middleUp && ringUp && pinkyUp) {
    return {
      intent: "User agrees/understands",
      confidence: 0.8,
      label: "OK Sign",
      source: "hand",
    };
  }

  return null;
}

// ── Face Analysis ──────────────────────────────────────────────────────────
// Key FaceLandmarker indices (478-point mesh):
//   1=nose tip, 13=upper lip center, 14=lower lip center,
//   61=left mouth corner, 291=right mouth corner,
//   159=left eye upper lid, 145=left eye lower lid,
//   386=right eye upper lid, 374=right eye lower lid,
//   70=left brow inner, 300=right brow inner

function analyzeFace(lm: NormalizedLandmark[]): GestureResult | null {
  if (lm.length < 400) return null;

  const noseTip = lm[1];
  const upperLip = lm[13];
  const lowerLip = lm[14];
  const leftCorner = lm[61];
  const rightCorner = lm[291];

  // Left eye openness
  const leftEyeOpen = Math.abs(lm[159].y - lm[145].y);
  // Right eye openness
  const rightEyeOpen = Math.abs(lm[386].y - lm[374].y);
  const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;

  const mouthWidth = dist(leftCorner, rightCorner);
  const mouthHeight = dist(upperLip, lowerLip);

  // Smile: corners pulled laterally AND upward relative to lower lip
  // A genuine smile widens the mouth and raises corners above the lip center
  const cornerAvgY = (leftCorner.y + rightCorner.y) / 2;
  const isSmiling = cornerAvgY < lowerLip.y - 0.015 && mouthWidth > 0.09;

  // Mouth open (talking / surprise)
  const mouthOpen = mouthHeight > 0.025;

  // Head turn: nose tip x deviates from center (0.5)
  const headTurnAmount = Math.abs(noseTip.x - 0.5);

  // Head tilt down: nose tip y is low in frame
  const headDown = noseTip.y > 0.58;

  // Eyes nearly closed (fatigue / drowsiness)
  const eyesClosed = avgEyeOpen < 0.012;

  // ── Rules ──────────────────────────────────────────────────────

  if (eyesClosed && !mouthOpen) {
    return {
      intent: "Possible low mood/fatigue",
      confidence: 0.82,
      label: "Eyes Closing",
      source: "face",
    };
  }

  if (isSmiling) {
    return {
      intent: "Positive emotional response",
      confidence: 0.88,
      label: "Smiling",
      source: "face",
    };
  }

  if (headTurnAmount > 0.18) {
    return {
      intent: "User distracted or uncomfortable",
      confidence: 0.82,
      label: "Looking Away",
      source: "face",
    };
  }

  if (headDown && !mouthOpen) {
    return {
      intent: "Possible low mood/fatigue",
      confidence: 0.72,
      label: "Head Down",
      source: "face",
    };
  }

  return null;
}

// ── Pose Analysis ──────────────────────────────────────────────────────────
// Key PoseLandmarker indices (33 points):
//   0=nose, 11=left shoulder, 12=right shoulder,
//   13=left elbow, 14=right elbow, 15=left wrist, 16=right wrist,
//   23=left hip, 24=right hip

function analyzePose(lm: NormalizedLandmark[]): GestureResult | null {
  if (lm.length < 25) return null;

  const nose = lm[0];
  const leftShoulder = lm[11];
  const rightShoulder = lm[12];
  const leftElbow = lm[13];
  const rightElbow = lm[14];
  const leftWrist = lm[15];
  const rightWrist = lm[16];
  const leftHip = lm[23];
  const rightHip = lm[24];

  // Shoulder symmetry — large difference indicates tension/leaning
  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

  // Shoulder elevation relative to hips
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const torsoHeight = hipMidY - shoulderMidY; // normally positive and > 0.2

  // Slouch: shoulders very close to hips in Y (torso compressed)
  const isSlouchedY = torsoHeight < 0.18;

  // Slouch: shoulders dropped forward — shoulders lower than nose by a lot
  const isSlouchedNose = shoulderMidY > nose.y + 0.25;

  // Arms raised — both wrists above shoulders
  const bothArmsUp =
    leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;

  // Arms crossed — wrists near opposite elbows (defensive posture)
  const leftWristNearRightElbow = dist(leftWrist, rightElbow) < 0.12;
  const rightWristNearLeftElbow = dist(rightWrist, leftElbow) < 0.12;
  const armsCrossed = leftWristNearRightElbow && rightWristNearLeftElbow;

  // Shrug — shoulders raised close to ears (high shoulder Y relative to nose)
  const shrugging = shoulderMidY < nose.y + 0.08 && shoulderDiff < 0.04;

  // ── Rules ──────────────────────────────────────────────────────

  if (armsCrossed) {
    return {
      intent: "User distracted or uncomfortable",
      confidence: 0.8,
      label: "Arms Crossed",
      source: "pose",
    };
  }

  if (shrugging) {
    return {
      intent: "User feeling stressed or tense",
      confidence: 0.75,
      label: "Shrugging",
      source: "pose",
    };
  }

  if (bothArmsUp) {
    return {
      intent: "User wants to respond",
      confidence: 0.78,
      label: "Arms Raised",
      source: "pose",
    };
  }

  if (isSlouchedY || isSlouchedNose) {
    return {
      intent: "Possible low mood/fatigue",
      confidence: 0.76,
      label: "Slouched Posture",
      source: "pose",
    };
  }

  if (shoulderDiff > 0.08) {
    return {
      intent: "User feeling stressed or tense",
      confidence: 0.7,
      label: "Tense Shoulders",
      source: "pose",
    };
  }

  return null;
}

// ── Main export ────────────────────────────────────────────────────────────
// Priority: hand > face > pose (hand gestures are most intentional/explicit)

export const analyzeGestures = (
  handLandmarks?: NormalizedLandmark[] | null,
  faceLandmarks?: NormalizedLandmark[] | null,
  poseLandmarks?: NormalizedLandmark[] | null,
): GestureResult => {
  if (handLandmarks && handLandmarks.length >= 21) {
    const result = analyzeHand(handLandmarks);
    if (result) return result;
  }

  if (faceLandmarks && faceLandmarks.length > 0) {
    const result = analyzeFace(faceLandmarks);
    if (result) return result;
  }

  if (poseLandmarks && poseLandmarks.length > 0) {
    const result = analyzePose(poseLandmarks);
    if (result) return result;
  }

  return NONE;
};
