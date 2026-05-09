"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/lib/store/user-store";

/**
 * Store Sync Component
 * Synchronizes the NextAuth session with the Zustand global user store.
 * Ensures profile changes are reflected across all components instantly.
 */
export function StoreSync() {
  const { data: session, status } = useSession();
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: (session.user as any).id,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: (session.user as any).role || "user",
        status: (session.user as any).status || "active",
        twoFactorEnabled: (session.user as any).twoFactorEnabled || false,
      });
    } else if (status === "unauthenticated") {
      clearUser();
    }
  }, [session, status, setUser, clearUser]);

  return null;
}
