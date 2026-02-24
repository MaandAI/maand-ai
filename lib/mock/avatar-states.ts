export type AvatarState = "calm" | "supportive" | "reflective" | "listening" | "thinking"
export type AvatarTone = "supportive" | "neutral" | "motivating"

export interface AvatarConfig {
  enabled: boolean
  tone: AvatarTone
  state: AvatarState
  lastInteraction?: string
}

// Mock chat states that trigger avatar reactions
export const CHAT_TRIGGER_WORDS = {
  supportive: ["struggling", "difficult", "hard", "anxious", "worried", "scared", "sad", "depressed"],
  reflective: ["think", "understand", "realize", "learned", "insight", "meaning", "wondering"],
  calm: ["better", "good", "peaceful", "relaxed", "calm", "grateful", "thankful", "progress"],
}

export const AVATAR_STATE_DESCRIPTIONS: Record<AvatarState, string> = {
  calm: "Luna is in a peaceful, grounded state, ready to support you.",
  supportive: "Luna is offering warm, compassionate support during a difficult moment.",
  reflective: "Luna is deeply engaged in understanding your thoughts and feelings.",
  listening: "Luna is actively listening to what you're sharing.",
  thinking: "Luna is processing your thoughts with care and attention.",
}

export const TONE_DESCRIPTIONS: Record<AvatarTone, string> = {
  supportive: "Warm, empathetic responses that validate your feelings",
  neutral: "Balanced, objective guidance with less emotional tone",
  motivating: "Encouraging, action-oriented support to inspire progress",
}
