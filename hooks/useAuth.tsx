"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  status: "authenticated" | "loading" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  status: "loading",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AuthInternalProvider>{children}</AuthInternalProvider>
    </SessionProvider>
  );
};

const AuthInternalProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const loading = status === "loading";

  // Map session user to profile structure for backward compatibility
  const profile: UserProfile | null = user ? {
    uid: (user as any).id,
    email: user.email || "",
    displayName: user.name || "",
    role: (user as any).role || "user",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  } : null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, status }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
