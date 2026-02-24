// Crisis keyword detection utility (mock implementation)
// In production, this would use more sophisticated NLP and sentiment analysis

export const CRISIS_KEYWORDS = [
  // Self-harm indicators
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "hurt myself",
  "cutting",
  "overdose",
  "end it all",
  // Crisis states
  "can't go on",
  "no reason to live",
  "better off dead",
  "hopeless",
  "worthless",
  "unbearable pain",
  "can't take it anymore",
]

export function detectCrisisKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
}

export const GROUNDING_EXERCISES = [
  {
    id: "5-4-3-2-1",
    name: "5-4-3-2-1 Grounding",
    description: "Use your five senses to bring yourself back to the present moment",
    steps: [
      "Name 5 things you can see around you",
      "Name 4 things you can touch or feel",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
    ],
  },
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "A simple breathing technique to calm your nervous system",
    steps: [
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 4 counts",
      "Hold your breath for 4 counts",
      "Repeat this cycle 4 times",
    ],
  },
  {
    id: "body-scan",
    name: "Body Scan",
    description: "Notice physical sensations to reconnect with your body",
    steps: [
      "Sit or lie in a comfortable position",
      "Notice your feet - wiggle your toes",
      "Notice your legs - feel them against the surface",
      "Notice your torso - feel your breath moving",
      "Notice your arms and hands - flex your fingers",
      "Notice your neck and face - relax your jaw",
    ],
  },
]
