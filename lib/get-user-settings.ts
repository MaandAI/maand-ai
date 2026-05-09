/**
 * Server-side helper to fetch user settings from the DB.
 * Use this inside API routes and backend services to respect feature flags.
 */
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  highContrast: boolean;
  notifications: {
    email: boolean;
    session: boolean;
    report: boolean;
    security: boolean;
  };
  aiPreferences: {
    autoReport: boolean;
    responseStyle: "empathetic" | "direct" | "analytical";
    contextPreservation: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  language: "en",
  timezone: "auto",
  highContrast: false,
  notifications: {
    email: true,
    session: true,
    report: true,
    security: true,
  },
  aiPreferences: {
    autoReport: true,
    responseStyle: "empathetic",
    contextPreservation: true,
  },
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select("settings email name").lean() as any;
    if (!user?.settings) return DEFAULT_SETTINGS;

    const s = user.settings;
    return {
      theme: s.theme ?? DEFAULT_SETTINGS.theme,
      language: s.language ?? DEFAULT_SETTINGS.language,
      timezone: s.timezone ?? DEFAULT_SETTINGS.timezone,
      highContrast: s.highContrast ?? DEFAULT_SETTINGS.highContrast,
      notifications: {
        email: s.notifications?.email ?? DEFAULT_SETTINGS.notifications.email,
        session: s.notifications?.session ?? DEFAULT_SETTINGS.notifications.session,
        report: s.notifications?.report ?? DEFAULT_SETTINGS.notifications.report,
        security: s.notifications?.security ?? DEFAULT_SETTINGS.notifications.security,
      },
      aiPreferences: {
        autoReport: s.aiPreferences?.autoReport ?? DEFAULT_SETTINGS.aiPreferences.autoReport,
        responseStyle: s.aiPreferences?.responseStyle ?? DEFAULT_SETTINGS.aiPreferences.responseStyle,
        contextPreservation:
          s.aiPreferences?.contextPreservation ?? DEFAULT_SETTINGS.aiPreferences.contextPreservation,
      },
    };
  } catch (err) {
    console.error("[getUserSettings] Error:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function getUserEmailAndName(
  userId: string
): Promise<{ email: string; name: string } | null> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select("email name").lean() as any;
    if (!user) return null;
    return { email: user.email, name: user.name };
  } catch {
    return null;
  }
}
