// Users & Roles
export type Role = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  subscription?: "free" | "basic" | "pro" | "enterprise";
  status?: "active" | "inactive" | "suspended";
  createdAt: Date | any; // serverTimestamp or Date type
  updatedAt: Date | any;
}

// Chat & Therapy
export interface ChatSession {
  id: string; // Document ID
  userId: string;
  persona: Record<string, any>;
  durationMs: number;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ChatMessage {
  id: string; // Document ID
  sessionId: string;
  content: string; // Encrypted text
  sender: "user" | "ai";
  emotion?: string;
  timestamp: Date | any;
}

// Legacy Profiles
export interface LegacyProfileInput {
  name: string;
  relationship: string;
  personalityTraits: string[];
  allowedTopics: string[];
  consentGiven: boolean;
  expiresAt: string;
}

export interface LegacyProfile extends LegacyProfileInput {
  id: string;
  createdAt: string;
  status: "active" | "inactive";
  // Encrypted fields: name, personalityTraits
}

// Therapy Analytics
export interface MoodEntry {
  id: string;
  date: Date | any;
  mood: number; // 1-10
  note?: string;
}

export interface OutcomeScore {
  id: string;
  type: "PHQ-9" | "GAD-7";
  score: number;
  maxScore: number;
  severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  date: Date | any;
  trend: "improving" | "stable" | "worsening";
}

// Administration
export interface WaitlistEntry {
  id?: string;
  email: string;
  name?: string;
  status: "pending" | "contacted" | "converted";
  createdAt: string | Date;
}

export interface TherapyModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "in-progress" | "completed";
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
}
