"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";

export function AppearanceManager() {
  const { settings } = useSettings();
  const { setTheme } = useTheme();
  const lastTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!settings) return;

    // Apply theme only when it changes (prevent loops)
    if (settings.theme && settings.theme !== lastTheme.current) {
      lastTheme.current = settings.theme;
      setTheme(settings.theme);
    }

    // Apply high contrast class
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Apply language
    if (settings.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings, setTheme]);

  return null;
}
