// Simple mock crisis detection logic.
// In production, this can be swapped with ML inference or external API (e.g., OpenAI/HuggingFace).

// Using regex for simple keyword extraction
const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end it all",
  "want to die",
  "hurt myself",
  "worthless",
  "no way out",
  "cut myself",
  "better off dead",
];

const CRISIS_REGEX = new RegExp(CRISIS_KEYWORDS.join("|"), "i");

export function detectCrisis(text: string): boolean {
  if (!text || text.trim() === "") return false;

  return CRISIS_REGEX.test(text);
}
