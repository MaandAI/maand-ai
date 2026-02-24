export type Mood = {
  id: string
  value: number // 1-10 scale
  label: string
  emoji: string
  color: string
}

export const moodOptions: Mood[] = [
  { id: "terrible", value: 1, label: "Terrible", emoji: "😢", color: "hsl(0, 84%, 60%)" },
  { id: "bad", value: 3, label: "Bad", emoji: "😟", color: "hsl(25, 95%, 53%)" },
  { id: "okay", value: 5, label: "Okay", emoji: "😐", color: "hsl(48, 96%, 53%)" },
  { id: "good", value: 7, label: "Good", emoji: "😊", color: "hsl(142, 71%, 45%)" },
  { id: "great", value: 9, label: "Great", emoji: "😄", color: "hsl(217, 91%, 60%)" },
]

export type MoodEntry = {
  id: string
  date: Date
  mood: number // 1-10
  note?: string
}

// Generate mock mood data for the last 7 days
export const mockMoodHistory: MoodEntry[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))
  return {
    id: `mood-${i}`,
    date,
    mood: Math.floor(Math.random() * 5) + 5, // Random between 5-9 (trending positive)
    note: i % 2 === 0 ? "Had a productive therapy session" : undefined,
  }
})

export type OutcomeScore = {
  id: string
  type: "PHQ-9" | "GAD-7"
  score: number
  maxScore: number
  severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe"
  date: Date
  trend: "improving" | "stable" | "worsening"
}

// PHQ-9 (Depression) scoring:
// 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-19: Moderately Severe, 20-27: Severe
export const mockPHQ9Scores: OutcomeScore[] = [
  {
    id: "phq-1",
    type: "PHQ-9",
    score: 8,
    maxScore: 27,
    severity: "mild",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    trend: "improving",
  },
  {
    id: "phq-2",
    type: "PHQ-9",
    score: 12,
    maxScore: 27,
    severity: "moderate",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    trend: "improving",
  },
]

// GAD-7 (Anxiety) scoring:
// 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-21: Severe
export const mockGAD7Scores: OutcomeScore[] = [
  {
    id: "gad-1",
    type: "GAD-7",
    score: 6,
    maxScore: 21,
    severity: "mild",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    trend: "stable",
  },
  {
    id: "gad-2",
    type: "GAD-7",
    score: 11,
    maxScore: 21,
    severity: "moderate",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    trend: "improving",
  },
]

export function getSeverityColor(severity: OutcomeScore["severity"]): string {
  switch (severity) {
    case "minimal":
      return "hsl(142, 71%, 45%)"
    case "mild":
      return "hsl(48, 96%, 53%)"
    case "moderate":
      return "hsl(25, 95%, 53%)"
    case "moderately-severe":
      return "hsl(0, 72%, 51%)"
    case "severe":
      return "hsl(0, 84%, 60%)"
  }
}

export function getTrendIcon(trend: OutcomeScore["trend"]): string {
  switch (trend) {
    case "improving":
      return "↓"
    case "stable":
      return "→"
    case "worsening":
      return "↑"
  }
}
