import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TherapistPersona } from "@/lib/therapist-personas";

export type TherapistAvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "calm"
  | "supportive"
  | "reflective";

interface TherapistState {
  /** Currently selected therapist ID (e.g. "ava", "ethan", "maya") */
  selectedTherapistId: string;
  /** Live avatar animation state during a session */
  avatarState: TherapistAvatarState;
  /** Whether an active session is in progress */
  isSessionActive: boolean;
  /** Session type that is currently running */
  sessionType: "chat" | "video" | null;
  /** Current active session ID */
  activeSessionId: string | null;
  /** Timestamp of last therapist selection */
  lastSelectedAt: number | null;

  // Actions
  selectTherapist: (id: string) => void;
  setAvatarState: (state: TherapistAvatarState) => void;
  startSession: (type: "chat" | "video", sessionId?: string) => void;
  endSession: () => void;
  setActiveSessionId: (id: string | null) => void;
}

/**
 * Global Therapist Store
 * Manages the selected AI therapist identity and session state across the entire app.
 * Deliberately SEPARATE from the user/auth store to prevent state conflicts.
 * Persists to localStorage so the therapist is remembered across page refreshes.
 */
export const useTherapistStore = create<TherapistState>()(
  persist(
    (set) => ({
      selectedTherapistId: "ava",
      avatarState: "idle",
      isSessionActive: false,
      sessionType: null,
      activeSessionId: null,
      lastSelectedAt: null,

      selectTherapist: (id) =>
        set({
          selectedTherapistId: id,
          lastSelectedAt: Date.now(),
          // Reset session when therapist changes
          isSessionActive: false,
          sessionType: null,
          activeSessionId: null,
          avatarState: "idle",
        }),

      setAvatarState: (state) => set({ avatarState: state }),

      startSession: (type, sessionId) =>
        set({
          isSessionActive: true,
          sessionType: type,
          activeSessionId: sessionId || null,
          avatarState: "calm",
        }),

      endSession: () =>
        set({
          isSessionActive: false,
          sessionType: null,
          activeSessionId: null,
          avatarState: "idle",
        }),

      setActiveSessionId: (id) => set({ activeSessionId: id }),
    }),
    {
      name: "maand-therapist-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist identity fields, not ephemeral session state
      partialize: (state) => ({
        selectedTherapistId: state.selectedTherapistId,
        lastSelectedAt: state.lastSelectedAt,
      }),
    }
  )
);

/** Convenience selector — returns the selected therapist ID */
export const useSelectedTherapistId = () =>
  useTherapistStore((s) => s.selectedTherapistId);
