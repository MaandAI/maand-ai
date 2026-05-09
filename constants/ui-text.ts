/**
 * UI Text Constants
 * Centralized repository for all application strings to prevent hardcoding.
 */
export const UI_TEXT = {
  DASHBOARD: {
    TITLE: "Clinical Hub",
    DESCRIPTION: "Monitor your therapeutic progress and AI-driven clinical insights.",
    STATS_HEADER: "Performance Overview",
    ACTIVITY_HEADER: "Recent Activity",
    EMPTY_SESSIONS: "No recent sessions found. Start a new conversation to begin your journey.",
  },
  PROFILE: {
    TITLE: "Clinical Identity",
    DESCRIPTION: "Manage your profile, biography, and professional metadata.",
    SAVE_SUCCESS: "Profile updated successfully.",
    SAVE_ERROR: "Failed to update profile. Please try again.",
  },
  SETTINGS: {
    TITLE: "System Preferences",
    DESCRIPTION: "Configure your therapeutic environment and security protocols.",
    APPEARANCE: "Appearance",
    SECURITY: "Security & Privacy",
    NOTIFICATIONS: "Notification Protocol",
  },
  COMMON: {
    LOADING: "Syncing data...",
    ERROR: "An error occurred",
    SAVE: "Save Changes",
    CANCEL: "Cancel",
  }
};

export const DASHBOARD_CONFIG = {
  MAX_RECENT_SESSIONS: 5,
};
