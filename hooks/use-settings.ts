"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_SETTINGS = {
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

function mergeWithDefaults(partial: any): any {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(partial?.notifications ?? {}) },
    aiPreferences: { ...DEFAULT_SETTINGS.aiPreferences, ...(partial?.aiPreferences ?? {}) },
  };
}

export function useSettings() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasFetched = useRef(false);

  // Always fetch fresh settings from DB on mount (source of truth)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data?.settings) {
        const merged = mergeWithDefaults(json.data.settings);
        setSettings(merged);
        return merged;
      }
    } catch (err) {
      console.error("[useSettings] fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
    const defaults = mergeWithDefaults({});
    setSettings(defaults);
    return defaults;
  }, []);

  // Fetch once when authenticated
  useEffect(() => {
    if (status === "authenticated" && !hasFetched.current) {
      hasFetched.current = true;
      fetchSettings().then((s) => {
        if (s?.theme) setTheme(s.theme);
      });
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, fetchSettings, setTheme]);

  const updateSettings = useCallback(
    async (newSettings: any): Promise<boolean> => {
      const previous = settings;
      // Optimistic update
      setSettings(newSettings);
      if (newSettings.theme && newSettings.theme !== previous?.theme) {
        setTheme(newSettings.theme);
      }

      setIsSaving(true);
      try {
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: newSettings }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }

        // Use the server's canonical response as the source of truth
        const saved = mergeWithDefaults(json.data.settings);
        setSettings(saved);
        return true;
      } catch (err: any) {
        console.error("[useSettings] update failed:", err);
        setSettings(previous);
        toast({
          title: "Could not save settings",
          description: err.message || "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [settings, setTheme, toast]
  );

  return { settings, updateSettings, isLoading, isSaving, refetch: fetchSettings };
}
