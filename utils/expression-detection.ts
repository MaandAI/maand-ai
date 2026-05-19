export enum ExpressionType {
  HAPPY = "Happy",
  SAD = "Sad",
  ANGRY = "Angry",
  FEARFUL = "Fearful",
  SURPRISED = "Surprised",
  DISGUSTED = "Disgusted",
  NEUTRAL = "Neutral",
  WAITING = "Waiting...",
  NOFACE = "No Face Detected",
  ERROR = "Error",
}

export interface expressionResult {
  emotion: string;
  confidence: number;
  emotionResult: ExpressionType;
  source: string;
}
