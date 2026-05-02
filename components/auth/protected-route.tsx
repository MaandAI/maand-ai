"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only process logic when Firebase auth has finished initializing
    if (loading) return;

    if (!user) {
      console.log("Not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }

    if (requireAdmin) {
      // If we require admin, wait for the profile to load to check role
      if (!profile) return; // Might still be fetching the profile after user is loaded

      if (profile.role !== "admin") {
        console.warn("User is not an admin, redirecting to dashboard...");
        router.push("/dashboard");
        return;
      }
    } else {
      // Logic for standard protected routes prohibiting admins if explicitly separating them
      // If an admin tries to hit /dashboard, we allow it for the "User View" feature.
    }

    setIsReady(true);
  }, [user, profile, loading, requireAdmin, router, pathname]);

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
