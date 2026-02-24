// Mock therapy modules data
export interface TherapyModule {
  id: string
  name: string
  description: string
  icon: string
  status: "active" | "in-progress" | "completed"
  progress: number
  sessionsCompleted: number
  totalSessions: number
}

export const mockTherapyModules: TherapyModule[] = [
  {
    id: "1",
    name: "AI-Assisted Therapy",
    description: "CBT-based conversations with empathetic AI",
    icon: "Brain",
    status: "in-progress",
    progress: 65,
    sessionsCompleted: 13,
    totalSessions: 20,
  },
  {
    id: "2",
    name: "Immersive Therapy Environments",
    description: "VR exposure therapy for anxiety disorders",
    icon: "Glasses",
    status: "active",
    progress: 30,
    sessionsCompleted: 6,
    totalSessions: 20,
  },
  {
    id: "3",
    name: "Accessibility Features",
    description: "Voice-controlled navigation and interactions",
    icon: "Accessibility",
    status: "completed",
    progress: 100,
    sessionsCompleted: 15,
    totalSessions: 15,
  },
  {
    id: "4",
    name: "Progress Tracking",
    description: "Comprehensive analytics and monitoring",
    icon: "TrendingUp",
    status: "active",
    progress: 0,
    sessionsCompleted: 0,
    totalSessions: 12,
  },
]
