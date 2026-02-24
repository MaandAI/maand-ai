"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUserRole } from "@/lib/auth";
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log("isautheticated", authenticated);
      if (authenticated) {
        router.push("/login");
        return;
      }

      if (requireAdmin) {
        const role = getCurrentUserRole();
        if (role !== "admin") {
          router.push("/dashboard");
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
