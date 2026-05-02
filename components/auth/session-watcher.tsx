"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function SessionWatcher() {
  const router = useRouter();
  const { toast } = useToast();

  const handleInactivityLogout = useCallback(async () => {
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity for security.",
      variant: "destructive",
    });
    await signOut({ callbackUrl: "/login" });
  }, [toast]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT_MS);
    };

    // Listen to standard interaction events
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [handleInactivityLogout]);

  return null; // Invisible logical component
}
